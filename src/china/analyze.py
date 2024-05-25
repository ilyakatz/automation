import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import json
from transformers import BertTokenizer, BertForSequenceClassification
import torch


def analyze_reviews_for_origin(reviews):
    """
    Analyzes the reviews to determine if the product is made in China.

    Args:
        reviews: A list of dictionaries containing extracted review details.

    Returns:
        True if the product is likely made in China, False otherwise.
    """
    # Load pre-trained BERT tokenizer
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    # Load fine-tuned BERT model for sequence classification
    model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=2)  # Assuming binary classification

    # Prepare review text for input into the model
    review_texts = [review['title'] + ' ' + review['body'] for review in reviews]

    # Tokenize and encode review texts
    inputs = tokenizer(review_texts, padding=True, truncation=True, return_tensors="pt")

    # Perform inference using the model
    with torch.no_grad():
        outputs = model(**inputs)

    # Predictions (assuming binary classification)
    predictions = torch.argmax(outputs.logits, dim=1).tolist()

    # Check if any review predicts the product is made in China
    return any(pred == 1 for pred in predictions)

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

def navigate_to_next_page(driver):
    """
    Clicks on the 'Next' button to navigate to the next page of reviews.

    Args:
        driver: A Selenium WebDriver object representing the browser.
    """
    try:
        next_button = driver.find_element(By.XPATH, "//li[@class='a-last']/a")
        next_button.click()
        return True
    except:
        return False

def scroll_and_load_reviews(driver):
    """
    Scrolls down the review page to dynamically load all reviews.

    Args:
        driver: A Selenium WebDriver object representing the browser.
    """
    last_height = 0
    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)  # Adjust wait time as needed
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

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
  reviews = []
  driver.get(url)

  while True:
      scroll_and_load_reviews(driver)
      time.sleep(1)  # Introduce a delay after scrolling
      page_source = driver.page_source
      soup = BeautifulSoup(page_source, 'html.parser')

      reviews.extend(parse_reviews(soup))

      if not navigate_to_next_page(driver):
          print("No more reviews to load.")
          break

      print(f"Scraped {len(reviews)} reviews so far.")

  driver.quit()

  return reviews

def save_reviews_to_file(reviews, filename):
    """
    Saves the reviews to a JSON file.

    Args:
        reviews: A list of dictionaries containing extracted review details.
        filename: The name of the file to save the reviews to.
    """
    with open(filename, 'w') as f:
        json.dump(reviews, f, indent=4)

def load_reviews_from_file(filename):
    """
    Loads the reviews from a JSON file.

    Args:
        filename: The name of the file containing the reviews.

    Returns:
        A list of dictionaries containing extracted review details.
    """
    with open(filename, 'r') as f:
        reviews = json.load(f)
    return reviews

if __name__ == "__main__":
    # asin = input("Enter Amazon product ASIN: ")
    asin = "B07VFHFBLL"
    reviews_filename = f"json/{asin}_reviews.json"

    # Check if reviews are saved in a file
    try:
        reviews = load_reviews_from_file(reviews_filename)
        print("Reviews loaded from file.")
    except FileNotFoundError:
        # If reviews file not found, scrape reviews and save them to a file
        reviews = scrape_amazon_reviews(asin)
        save_reviews_to_file(reviews, reviews_filename)
        print("Reviews scraped and saved to file.")

    is_made_in_china = analyze_reviews_for_origin(reviews)
    if is_made_in_china:
        print("The product is likely made in China.")
    else:
        print("The product is not necessarily made in China.")
    # for review in reviews:
        # print(colorize_json(review))