import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import json

# Function to colorize JSON string
def colorize_json(json_str):
    return "\033[93m" + json.dumps(json_str, indent=4) + "\033[0m"

def launch_chrome_browser(options):
  """
  Launches Chrome browser in headless mode with desired options.

  Args:
      options: A Selenium ChromeOptions object with desired settings.

  Returns:
      A Selenium WebDriver object representing the launched browser.
  """
  service = Service(ChromeDriverManager().install())  # Assuming you're using WebDriverManager
  driver = webdriver.Chrome(service=service, options=options)
  return driver

def build_amazon_review_url(asin):
  """
  Builds the URL for a specific Amazon product review page.

  Args:
      asin: The ASIN (Amazon Standard Identification Number) of the product.

  Returns:
      A string representing the URL for the product review page.
  """
  base_url = f"https://www.amazon.com/product-reviews/{asin}/"
  return base_url

def scroll_and_load_reviews(driver):
  """
  Scrolls down the review page to dynamically load more reviews.

  Args:
      driver: A Selenium WebDriver object representing the browser.
  """
  for _ in range(3):
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)  # Adjust wait time as needed

def parse_reviews(soup):
  """
  Parses the HTML content and extracts review details.

  Args:
      soup: A BeautifulSoup object representing the parsed HTML.

  Returns:
      A list of dictionaries containing extracted review details (title, body, rating, date).
  """
  reviews = []
  for review_div in soup.find_all('div', {'data-hook': 'review'}):
    review = {
      'title': review_div.find('a', {'data-hook': 'review-title'}).get_text(strip=True),
      'body': review_div.find('span', {'data-hook': 'review-body'}).get_text(strip=True),
      'rating': review_div.find('i', {'data-hook': 'review-star-rating'}).get_text(strip=True),
      'date': review_div.find('span', {'data-hook': 'review-date'}).get_text(strip=True),
    }
    reviews.append(review)
  return reviews

def scrape_amazon_reviews(asin):
  """
  Scrapes reviews for a specific Amazon product using provided ASIN.

  Args:
      asin: The ASIN (Amazon Standard Identification Number) of the product.

  Returns:
      A list of dictionaries containing extracted review details (title, body, rating, date).
  """
  options = Options()
  options.add_argument("--headless")
  options.add_argument("--disable-extensions")
  options.add_argument("--disable-gpu")
  options.add_argument("--no-sandbox")  # Bypass OS security model
  options.add_argument("--disable-dev-shm-usage")  # Overcome limited resource problems

  driver = launch_chrome_browser(options)
  url = build_amazon_review_url(asin)
  driver.get(url)

  scroll_and_load_reviews(driver)
  page_source = driver.page_source
#   print(page_source)
  soup = BeautifulSoup(page_source, 'html.parser')

  reviews = parse_reviews(soup)
  driver.quit()

  return reviews

if __name__ == "__main__":
    # asin = input("Enter Amazon product ASIN: ")
    asin = "B07VFHFBLL"
    reviews = scrape_amazon_reviews(asin)
    for review in reviews:
        print(colorize_json(review))