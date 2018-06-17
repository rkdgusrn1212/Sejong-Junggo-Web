import os
import sys
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

ff_driver = webdriver.Chrome()

front_url = 'http://search.danawa.com/dsearch.php?k1='
query = sys.argv[1] #사용자가 입력한 검색어

back_url = '&module=goods&act=dispMain'
ff_driver.get(front_url + query + back_url) #해당 url로 이동
ff_driver.implicitly_wait(10)

ff_driver.find_element_by_class_name("research_area").click() #검색 상세조건 설정
ff_driver.implicitly_wait(30)

keyword = ff_driver.find_element_by_id("search_exclude") #중고 키워드 입력
keyword.send_keys("중고")

ff_driver.find_element_by_id("btn_de_srch").click() #검색 클릭
ff_driver.implicitly_wait(30)

standard_price = ff_driver.find_element_by_class_name("click_log_product_standard_price_").text #신뢰성 높은 가격정보
print(standard_price[:-1])#시세가에 포함된 원 자르기위해 수정함
ff_driver.quit()#웹드라이버가 크롤링 후 종료되는 로직 추가함.
