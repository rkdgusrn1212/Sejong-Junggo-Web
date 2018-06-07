import os
import requests
import request
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup

ff_driver = webdriver.Chrome()
ff_driver.get("http://search.danawa.com/dsearch.php?k1=아이폰&module=goods&act=dispMain")
ff_driver.implicitly_wait(10)

ff_driver.find_element_by_class_name("research_area").click()
ff_driver.implicitly_wait(30)

keyword = ff_driver.find_element_by_id("search_exclude")
keyword.send_keys("중고")

ff_driver.find_element_by_id("btn_de_srch").click()
ff_driver.implicitly_wait(30)

standard_price = ff_driver.find_element_by_class_name("click_log_product_standard_price_").text
print (standard_price)

