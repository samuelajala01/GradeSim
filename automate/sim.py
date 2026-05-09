#!/usr/bin/env python3
"""Drive the GradeSim dashboard to bulk-add semesters/courses from automate/courses.json."""
import json
import os
import sys
import time
import logging
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).resolve().parent
WAIT_SEC = 30

# #region agent log
_DEBUG_SESSION = "66db33"
_DEBUG_LOG_PATH = SCRIPT_DIR.parent / ".cursor" / "debug-66db33.log"


def _agent_dbg(hypothesis_id, location, message, data, run_id="pre-fix"):
    line = {
        "sessionId": _DEBUG_SESSION,
        "runId": run_id,
        "hypothesisId": hypothesis_id,
        "location": location,
        "message": message,
        "data": data,
        "timestamp": int(time.time() * 1000),
    }
    try:
        _DEBUG_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(_DEBUG_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(line, ensure_ascii=False) + "\n")
    except OSError:
        pass


def _dom_probe_new_sem(driver):
    return driver.execute_script(
        """
        function q(sel) {
          try { return !!document.querySelector(sel); }
          catch (e) { return false; }
        }
        const linked = document.querySelector('button[type="submit"][form="new-sem-form"]');
        const nested = document.querySelector('#new-sem-form button[type="submit"]');
        const formEl = document.getElementById('new-sem-form');
        let linkedText = null;
        if (linked && linked.textContent) linkedText = linked.textContent.trim();
        return {
          has_sem_input: q('#sem-input'),
          has_new_sem_form_id: !!formEl,
          submit_descendant_of_form: !!nested,
          submit_linked_by_form_attr: !!linked,
          linked_submit_text_sample: linkedText,
          nested_form_buttons_count:
            formEl ? formEl.querySelectorAll('button').length : -1,
        };
        """
    )


# #endregion agent log

def submit_add_semester(driver):
    """Click the dashboard 'Add' control for creating a semester (button is linked via HTML form="" attr)."""
    # #region agent log
    probe = _dom_probe_new_sem(driver)
    _agent_dbg("H_linked_form", "sim.py:submit_add_semester", "DOM before Add-semester click", probe)
    # #endregion agent log

    sel_link = (
        By.CSS_SELECTOR,
        'button[type="submit"][form="new-sem-form"]',
    )
    btn = driver.find_element(*sel_link)
    btn.click()


def xpath_literal(s):
    """Escape arbitrary string for use in XPath string literal."""
    if "'" not in s:
        return "'" + s + "'"
    parts = s.split("'")
    return (
        "concat("
        + ", ".join(
            f"'{p}'"
            + (", \"'\"" if i < len(parts) - 1 else "")
            for i, p in enumerate(parts)
        )
        + ")"
    )


def is_logged_in(driver):
    try:
        driver.find_element(By.CSS_SELECTOR, "#sem-input")
        return True
    except NoSuchElementException:
        return False


def login(driver, email, password):
    logger.info("Logging in...")
    wait = WebDriverWait(driver, WAIT_SEC)
    email_el = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#email")))
    pwd_el = driver.find_element(By.CSS_SELECTOR, "#password")
    email_el.clear()
    email_el.send_keys(email)
    pwd_el.clear()
    pwd_el.send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "form button[type='submit']").click()

    try:
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#sem-input")))
        logger.info("Login successful!")
    except TimeoutException:
        hint = ""
        try:
            err_el = driver.find_element(By.CSS_SELECTOR, ".text-danger")
            hint = (err_el.text or "").strip()
        except NoSuchElementException:
            pass
        extra = f" ({hint})" if hint else " Check credentials and Firebase config."
        raise TimeoutException(
            f"Dashboard did not load after sign-in.{extra}"
        ) from None


def semester_card_and_table(driver, semester_name):
    """Return (card_el, tbody_el) for a semester titled exactly semester_name."""
    lit = xpath_literal(semester_name)
    heading = driver.find_element(
        By.XPATH,
        f"//h2[normalize-space()={lit}]",
    )
    card = heading.find_element(
        By.XPATH,
        "./ancestor::div[contains(@class,'rounded-md')]"
        "[contains(@class,'border-border')][1]",
    )
    tbody = card.find_element(By.CSS_SELECTOR, "tbody")
    return card, tbody


def main():
    courses_path = SCRIPT_DIR / "courses.json"
    if not courses_path.is_file():
        logger.error(f"Missing {courses_path}")
        sys.exit(1)

    email = input("Email: ").strip()
    password = input("Password: ").strip()

    with open(courses_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    opts = Options()
    # Helps some Linux setups; omit or comment if you prefer a visible banner.
    # opts.add_argument("--headless=new")

    driver = None
    try:
        driver = webdriver.Chrome(options=opts)
        driver.implicitly_wait(2)

        driver.get(os.environ.get("GRADESIM_URL", "http://localhost:5173/"))

        WebDriverWait(driver, WAIT_SEC).until(
            EC.any_of(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#sem-input")),
                EC.presence_of_element_located((By.CSS_SELECTOR, "#email")),
            )
        )

        if not is_logged_in(driver):
            login(driver, email, password)

        driver.get(os.environ.get("GRADESIM_URL", "http://localhost:5173/"))

        WebDriverWait(driver, WAIT_SEC).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#sem-input")),
        )

        wait = WebDriverWait(driver, WAIT_SEC)

        for semester_name, courses in data.items():
            logger.info("Processing %s", semester_name)

            name_input = driver.find_element(By.CSS_SELECTOR, "#sem-input")
            name_input.clear()
            name_input.send_keys(semester_name)

            submit_add_semester(driver)

            lit = xpath_literal(semester_name)
            try:
                wait.until(
                    EC.presence_of_element_located(
                        (By.XPATH, f"//h2[normalize-space()={lit}]")
                    )
                )
            except TimeoutException:
                logger.warning("Semester card did not appear in time.")

            card, _ = semester_card_and_table(driver, semester_name)

            for course_code, units, grade in courses:
                try:
                    card.find_element(
                        By.XPATH,
                        ".//button[normalize-space()='Add course']",
                    ).click()
                    time.sleep(0.3)

                    _, tbody_now = semester_card_and_table(driver, semester_name)

                    tbody_rows = tbody_now.find_elements(By.TAG_NAME, "tr")
                    if not tbody_rows:
                        raise RuntimeError("no rows")

                    editable = tbody_rows[-1].find_elements(
                        By.XPATH,
                        ".//input[not(@disabled)]",
                    )
                    if len(editable) < 3:
                        raise RuntimeError("expected Course, Units, Points inputs")

                    editable[0].clear()
                    editable[0].send_keys(str(course_code))
                    editable[1].clear()
                    editable[1].send_keys(str(units))
                    editable[2].clear()
                    editable[2].send_keys(str(grade))
                    editable[2].send_keys(Keys.TAB)
                    time.sleep(0.2)

                    card, _ = semester_card_and_table(driver, semester_name)
                    logger.info("Added: %s", course_code)
                except Exception as e:
                    logger.error("Failed: %s - %s", course_code, e)

        try:
            cgpa = driver.find_element(
                By.XPATH,
                "//div[contains(@class,'uppercase')][normalize-space()='CGPA']"
                "/following-sibling::div[contains(@class,'text-accent')]",
            ).text
            logger.info("Final CGPA: %s", cgpa)
        except NoSuchElementException:
            logger.warning("Could not get CGPA from dashboard")

        input("Press Enter to close…")

    except Exception as e:
        logger.exception("Fatal: %s", e)
        sys.exit(1)
    finally:
        if driver:
            driver.quit()


if __name__ == "__main__":
    main()
