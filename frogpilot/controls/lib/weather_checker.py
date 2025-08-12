#!/usr/bin/env python3
import json
import os
import requests
import time

from concurrent.futures import ThreadPoolExecutor
from datetime import timezone

import openpilot.system.sentry as sentry

from openpilot.frogpilot.common.frogpilot_utilities import is_url_pingable

API_KEY = os.environ.get("WEATHER_TOKEN", "")
CHECK_INTERVAL = 5 * 60
MAX_RETRIES = 3
RETRY_DELAY = 60

class WeatherChecker:
  def __init__(self):
    self.is_daytime = False
    self.updating_weather = False

    self.weather_id = 0

    self.last_updated = None
    self.visibility = None

    self.session = requests.Session()
    self.session.headers.update({"Accept-Language": "en"})
    self.session.headers.update({"User-Agent": "frogpilot-weather-checker/1.0 (https://github.com/FrogAi/FrogPilot)"})

    self.executor = ThreadPoolExecutor(max_workers=1)

  def update_weather(self, gps_position, now):
    if self.updating_weather:
      return

    if self.last_updated and (now - self.last_updated).total_seconds() < CHECK_INTERVAL:
      return

    if not API_KEY or not gps_position or not is_url_pingable("https://openweathermap.org"):
      return

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
      "lat": gps_position["latitude"],
      "lon": gps_position["longitude"],
      "appid": API_KEY,
      "units": "metric",
    }

    def make_request():
      try:
        self.updating_weather = True

        attempt = 0
        while attempt < MAX_RETRIES:
          try:
            response = self.session.get(url, params=params, timeout=10)
            if response.status_code == 429:
              raise requests.exceptions.RetryError("Rate limited (429 Too Many Requests)")

            response.raise_for_status()
            return response.json()
          except (requests.exceptions.RequestException, ValueError) as exception:
            attempt += 1
            sentry.capture_exception(exception)
            print(f"[WeatherChecker] Attempt {attempt} failed: {exception}")

            if attempt >= MAX_RETRIES:
              print("[WeatherChecker] Max retries reached. Giving up...")
              return None

            time.sleep(RETRY_DELAY)
      finally:
        self.updating_weather = False

    def complete_request(future):
      try:
        data = future.result()
        if not data:
          return
        print(json.dumps(data, indent=2))

        self.last_updated = now

        weather = data.get("weather", [{}])[0]
        sys = data.get("sys", {})

        self.is_daytime = sys.get("sunrise") <= int(now.astimezone(timezone.utc).timestamp()) < sys.get("sunset")
        self.visibility = data.get("visibility")
        self.weather_id = weather.get("id")
      except Exception as exception:
        print(f"[WeatherChecker] Callback error: {exception}")
        sentry.capture_exception(exception)

    future = self.executor.submit(make_request)
    future.add_done_callback(complete_request)
