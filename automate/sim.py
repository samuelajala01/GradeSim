#!/usr/bin/env python3
import json
import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

def is_logged_in(driver):
    try:
        driver.find_element(By.XPATH, "//input[@placeholder='Enter semester name']")
        return True
    except:
        return False

def login(driver, email, password):
    logger.info("Logging in...")
    wait = WebDriverWait(driver, 10)
    
    email_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email' or contains(@placeholder, 'mail')]")))
    password_input = driver.find_element(By.XPATH, "//input[@type='password']")
    
    email_input.send_keys(email)
    password_input.send_keys(password)
    driver.find_element(By.XPATH, "//button[contains(text(), 'Login') or @type='submit']").click()
    
    wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Enter semester name']")))
    logger.info("Login successful!")

try:
    # Get credentials and load data
    email = input("Email: ").strip()
    password = input("Password: ").strip()
    
    with open('courses.json', 'r') as f:
        data = json.load(f)
    
    # Start browser and login
    driver = webdriver.Chrome()
    driver.get("http://localhost:5173")
    time.sleep(3)
    
    if not is_logged_in(driver):
        login(driver, email, password)
        time.sleep(2)
    
    # Process each semester
    for semester_name, courses in data.items():
        logger.info(f"Processing {semester_name}")
        
        # Create table
        name_input = driver.find_element(By.XPATH, "//input[@placeholder='Enter semester name']")
        name_input.clear()
        name_input.send_keys(semester_name)
        driver.find_element(By.XPATH, "//button[contains(text(), 'Create table')]").click()
        time.sleep(2)
        
        # Get current table and add courses
        current_table = driver.find_elements(By.XPATH, "//div[contains(@class, 'mt-8') and contains(@class, 'bg-black')]")[-1]
        
        for course_code, units, grade in courses:
            try:
                current_table.find_element(By.XPATH, ".//button[contains(text(), 'Add Course')]").click()
                time.sleep(1)
                
                # Fill last row
                tbody_rows = current_table.find_elements(By.XPATH, ".//tbody/tr")
                inputs = tbody_rows[-1].find_elements(By.XPATH, ".//input[not(@disabled)]")
                
                inputs[0].send_keys(course_code)
                inputs[1].send_keys(str(units))
                inputs[2].send_keys(str(grade))
                inputs[2].send_keys(Keys.TAB)
                time.sleep(0.5)
                
                logger.info(f"Added: {course_code}")
            except Exception as e:
                logger.error(f"Failed: {course_code} - {e}")
    
    # Get final CGPA
    try:
        cgpa = driver.find_element(By.XPATH, "//p[contains(text(), 'CGPA:')]//span[@class='text-blue-600']").text
        logger.info(f"Final CGPA: {cgpa}")
    except:
        logger.warning("Could not get CGPA")
    
    input("Press Enter to close...")

except Exception as e:
    logger.error(f"Error: {e}")
finally:
    try:
        driver.quit()
    except:
        pass