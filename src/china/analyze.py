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
import spacy
import os

COMPLETED_FOLDER = "json"

def colorize_output(text, is_red):
    if is_red:
        return f"\033[91m{text}\033[0m"  # ANSI escape code for red color
    else:
        return f"\033[92m{text}\033[0m"  # ANSI escape code for green color

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
        review = {}
        # Extract review title
        title_elem = review_div.find('a', {'data-hook': 'review-title'})
        review['title'] = title_elem.get_text(strip=True) if title_elem else "Title not found"

        # Extract review body
        body_elem = review_div.find('span', {'data-hook': 'review-body'})
        review['body'] = body_elem.get_text(strip=True) if body_elem else "Body not found"

        # Extract review rating
        rating_elem = review_div.find('i', {'data-hook': 'review-star-rating'})
        review['rating'] = rating_elem.get_text(strip=True) if rating_elem else "Rating not found"

        # Extract review date
        date_elem = review_div.find('span', {'data-hook': 'review-date'})
        review['date'] = date_elem.get_text(strip=True) if date_elem else "Date not found"

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
        #   print("No more reviews to load.")
          break

      # print(f"Scraped {len(reviews)} reviews so far.")

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

def get_product_info(url):
    """
    Fetches the HTML content of the product homepage and extracts relevant information.

    Args:
        url: The URL of the product homepage on Amazon.

    Returns:
        A dictionary containing product information.
    """
    options = Options()
    options.add_argument("--headless")  # Run Chrome in headless mode
    options.add_argument("--disable-dev-shm-usage")  # Overcome limited resource problems
    options.add_argument("--no-sandbox")  # Bypass OS security model
    options.add_argument("--disable-gpu")  # Disable GPU acceleration
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    # Load the webpage
    driver.get(url)

    # Wait for the page to load (adjust the sleep time as needed)
    time.sleep(5)

    # Extract product information from the webpage
    product_info = {
        'url': url,
        'text': driver.page_source  # Get the HTML content of the page
    }

    # Close the WebDriver
    driver.quit()

    return product_info


def save_reviews_and_product_info(reviews, product_info, filename):
    """
    Saves the reviews and product information to a JSON file.

    Args:
        reviews: A list of dictionaries containing extracted review details.
        product_info: A dictionary containing product information.
        filename: The name of the file to save the data to.
    """
    data = {
        'product_info': product_info,
        'reviews': reviews
    }
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

    print(f"Reviews and product information saved to file '{filename}'.")

def detect_mentions_of_china(text):
    # Load pre-trained NER model
    nlp = spacy.load("en_core_web_sm")

    # Process text with the NER model in smaller chunks
    chunk_size = 100000  # Adjust as needed
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

    # Check for mentions of China, Chinese, or similar terms in each chunk
    for chunk in chunks:
        doc = nlp(chunk)
        for ent in doc.ents:
            if ent.text.lower() in ["china", "chinese", "china's", "china-made"]:
                return True
    return False

def analyze_product_info(product_info):
    product_description = product_info['text']
    print("Analyzing product description for mentions of China...")
    is_made_in_china = detect_mentions_of_china(product_description)
    print(colorize_output(f"Product description mentions China: {is_made_in_china}", is_made_in_china))
    return is_made_in_china

def analyze_reviews_for_origin(reviews):
    for review in reviews:
        review_text = review['body']
        if detect_mentions_of_china(review_text):
            print(colorize_output("Found review mentioning China:", True))
            return True
    print("No reviews mentioning China found.")
    return False

def search_amazon(query, query_filename):
    """
    Searches Amazon for a given query and extracts ASINs 
    (Amazon Standard Identification Numbers) of products.
    """
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = launch_chrome_browser(options)
    base_search_url = f"https://www.amazon.com/s?k={query.replace(' ', '+')}&page="
    
    asin_list = []
    page_number = 1
    while True:
        search_url = base_search_url + str(page_number)
        print(f"Searching page {page_number} with URL: {search_url}")
        driver.get(search_url)
        time.sleep(2)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Extract ASINs from the current page
        asins_on_page = [div.get('data-asin') for div in soup.find_all('div', {'data-asin': True}) if div.get('data-asin')]
        if not asins_on_page:
            print("No ASINs found on the current page.")
            break  # Exit the loop if no ASINs are found, indicating no more pages

        print(f"Found {len(asins_on_page)} ASINs on page {page_number}: {asins_on_page}")
        asin_list.extend(asins_on_page)
        page_number += 1
    
    driver.quit()

    # if asins are not empty, save them to a file
    if asin_list:
        # Save the list of ASINs to a file
        asin_filename = query_filename
        with open(asin_filename, 'w') as f:
            json.dump(asin_list, f, indent=4)
        print(f"ASIN list saved to file '{asin_filename}'.")

    return asin_list

def process_asin(asin):
    if is_analysis_done(asin):
        with open(f"{COMPLETED_FOLDER}/analysis_status_{asin}.json", 'r') as f:
            status_data = json.load(f)
        made_in_china = status_data.get("made_in_china", None)
        if made_in_china is not None:
            if made_in_china:
                print(colorize_output(f"Analysis already done for ASIN: {asin}. Product is made in China.", True))
            else:
                print(colorize_output(f"Analysis already done for ASIN: {asin}. Product is not made in China.", False))
        else:
            print(colorize_output(f"Analysis already done for ASIN: {asin}. Result: Unknown", False))
        return
    
    print(f"\nProcessing ASIN: {asin}")
    product_url = f"https://www.amazon.com/dp/{asin}"
    reviews_filename = f"json/{asin}.json"

    if not os.path.exists("json"):
        os.makedirs("json")

    data = load_or_scrape_data(asin, product_url, reviews_filename)
    made_in_china = analyze_product_data(asin, data)
    
    # Mark analysis as done for this ASIN
    mark_analysis_done(asin, made_in_china)

# Function to check if analysis has been performed for an ASIN
def is_analysis_done(asin):
    status_file = f"{COMPLETED_FOLDER}/analysis_status_{asin}.json"
    return os.path.exists(status_file)

# Function to mark analysis as done for an ASIN
def mark_analysis_done(asin, made_in_china):
    status_file = f"{COMPLETED_FOLDER}/analysis_status_{asin}.json"
    with open(status_file, 'w') as f:
        json.dump({"status": "done", "made_in_china": made_in_china}, f)

def analyze_product_data(asin, data):
    print("Analyzing product data...")

    is_made_in_china_info = analyze_product_info(data['product_info'])
    if is_made_in_china_info:
        print(colorize_output(f"The product {asin} is likely made in China.", True))
        return True
    else:
        is_made_in_china_reviews = analyze_reviews_for_origin(data['reviews'])
        if is_made_in_china_reviews:
            print(colorize_output(f"The product {asin} is likely made in China.", True))
            return
        else:
            print(colorize_output(f"The product {asin} is not necessarily made in China.", False))
            return False

def load_or_scrape_data(asin, product_url, reviews_filename):
    try:
        data = json.load(open(reviews_filename))
        print("Product data loaded from file.")
    except FileNotFoundError:
        print("Product data file not found. Scraping data...")
        reviews = scrape_amazon_reviews(asin)
        product_info = get_product_info(product_url)
        save_reviews_and_product_info(reviews, product_info, reviews_filename)
        data = json.load(open(reviews_filename))
        print("Product data scraped and saved to file.")
    return data

def main():
    query = "outdoor wall sconce"
    print(f"Searching Amazon for query: {query}")
    
    # Modify the query to make it suitable for a file name
    query_filename = query.replace(' ', '_')
    
    # Check if ASIN file exists
    asin_filename = f"{COMPLETED_FOLDER}/asin_list/asin_list_{query_filename}.json"
    if os.path.exists(asin_filename):
        with open(asin_filename, 'r') as f:
            asins = json.load(f)
        print(f"ASINs loaded from file: {asins}")
    else:
        print(f"ASIN file '{asin_filename}' not found.")
        # Perform search if ASIN file does not exist
        asins = search_amazon(query, asin_filename)
        print(f"Found ASINs: {asins}")

    for asin in asins:
        process_asin(asin)

if __name__ == "__main__":
    main()