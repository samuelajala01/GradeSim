import React, { useState, useEffect } from "react";

const Settings = () => {

  const [theme, setTheme] = useState("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [gpaScale, setGpaScale] = useState("4.0");


  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedNotifications = localStorage.getItem("notificationsEnabled") === "true";
    const savedGpaScale = localStorage.getItem("gpaScale") || "4.0";

    setTheme(savedTheme);
    setNotificationsEnabled(savedNotifications);
    setGpaScale(savedGpaScale);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("notificationsEnabled", notificationsEnabled);
    localStorage.setItem("gpaScale", gpaScale);
  }, [theme, notificationsEnabled, gpaScale]);

  // Apply theme to the body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Handle theme change
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  // Handle notifications toggle
  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  // Handle GPA scale change
  const handleGpaScaleChange = (e) => {
    setGpaScale(e.target.value);
  };

  return (
    <div className={`settings-page ${theme}`}>
      <h1>Settings</h1>

      {/* Theme Selection */}
      <div className="setting-item">
        <label htmlFor="theme">Theme:</label>
        <select id="theme" value={theme} onChange={handleThemeChange}>
          <option value="light">Light Mode</option>
          <option value="dark">Dark Mode</option>
        </select>
      </div>

      {/* Notifications Toggle */}
      <div className="setting-item">
        <label htmlFor="notifications">Enable Notifications:</label>
        <input
          type="checkbox"
          id="notifications"
          checked={notificationsEnabled}
          onChange={handleNotificationsToggle}
        />
      </div>

      {/* GPA Scale Selection */}
      <div className="setting-item">
        <label htmlFor="gpaScale">GPA Scale:</label>
        <select id="gpaScale" value={gpaScale} onChange={handleGpaScaleChange}>
          <option value="4.0">4.0 Scale</option>
          <option value="5.0">5.0 Scale</option>
          <option value="10.0">10.0 Scale</option>
        </select>
      </div>

      {/* Save Button (optional, since settings are auto-saved) */}
      <button onClick={() => alert("Settings saved!")}>Save Settings</button>
    </div>
  );
};

export default Settings;