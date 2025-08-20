from openpyxl import Workbook
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from bs4 import BeautifulSoup
import requests
from app import Class, db
from app import app
from urllib import parse
import json
import asyncio

def get_class_info(row,department):
    """
    授業の情報を取得する
    """
    error=""
    soup=BeautifulSoup(str(row),"html.parser")
    # 授業コー�?
    code=""
    
    code=soup.select_one("li  div.subjectListSummary > p:nth-child(2)").text.strip()
    try:
        code=code[code.find("�?)+1:]
    except:
        code="取得不可"
        error+=f"授業コード取得不�?{soup.select_one("li  div.subjectListSummary > p:nth-child(2)").text.strip()})"
    # 授業�?
    name=soup.select_one("li h3 > span.jp").text.strip()
    # 開講時期
    season=soup.select_one("li  div.subjectListSummary > p:nth-child(4)").text.strip()
    season=season[season.find("�?)+1:]
    day=""
    time=-1
    if soup.select_one("li  div.subjectListSummary > p:nth-child(5)").text.strip().split("�?)[1].find("集中・その他")!=-1:
        day="集中・その他"
        time=-10
    else:
        # 曜日
        day=soup.select_one("li div.subjectListSummary > p:nth-child(5)").text.strip()
        try:
            day=day[day.find("�?)+1:][0]
            time=int(soup.select_one("li  div.subjectListSummary > p:nth-child(5)").text.strip().split("�?)[1][1])
        except:
            day="取得不可"
            error+=f"曜日取得不可({soup.select_one("li div.subjectListSummary > p:nth-child(5)").text.strip()})"
            time=-1
            error+=f"時限取得不可({soup.select_one("li  div.subjectListSummary > p:nth-child(5)").text.strip()})"
    # 教員�?
    teacher=""
    try:
        teacher=soup.select_one("li  h4 > span.jp").text.strip()
        teacher=teacher[teacher.find("�?)+1:]
    except:
        teacher="取得不可"
        error+=f"教員名取得不�?{soup.select_one("li  h4 > span.jp").text.strip()})"
    # 教室�?
    place=""
    try:
        place=soup.select_one("li  div.subjectListSummary > p:nth-child(6)").text.strip()
        place=place[place.find("�?)+1:]
    except:
        place="取得不可"
        error+=f"教室名取得不�?{soup.select_one("li  div.subjectListSummary > p:nth-child(6)").text.strip()})"
    # 単位�?
    unit=-1
    try:
        unit=soup.select_one("li  div.subjectListSummary > p:nth-child(8)").text.strip()
        unit=int(unit[unit.find("�?)+1:])
    except:
        unit=-1
        error+=f"単位数取得不�?{soup.select_one("li  div.subjectListSummary > p:nth-child(8)").text.strip()})"
    note=""
    note=soup.select_one("li div.subjectListSummary > p:nth-child(9)").text.strip()
    try:
        note=note[note.find("�?)+1:]
    except:
        error+=f"備考取得不�?{soup.select_one("li div.subjectListSummary > p:nth-child(9)").text.strip()})"
    # 配当年次
    grade_min=-1
    grade_max=-1
    s=""
    try:
        s=soup.select_one("li div.subjectListSummary > p:nth-child(7)").text.strip()
        if s.find("�?)==-1 and s.find("�?)==-1:
            grade_min=int(s.split("�?)[1])
            grade_max=int(s.split("�?)[1])
        else:
            s=s.replace("�?,"").replace("�?,"")
            grade_min=int(s.split("�?)[1][0])
            grade_max=int(s.split("�?)[1][2])
    except:
        grade_min=-1
        grade_max=-1
        error+=f"配当年次取得不可({s}) "
    # シラバスURL
    url=""
    try:
        url="https://syllabus.hosei.ac.jp/web/"+soup.select_one("li > a").attrs["href"]
    except:
        url="urlなし"
    _class=Class(department=department,year=2025,code=code,name=name,season=season,time=time,place=place,url=url,teacher=teacher,unit=unit,grade_min=grade_min,grade_max=grade_max,note=note,day=day,error=error)
    print(name,code,season,error,_class.is_spring,_class.is_autumn,sep="�?)
    db.session.add(_class)
    return _class
    


def get_class_list(department,page):
    """
    授業のリストを取得す�?
    """
    print(f"{department}の{page}ページ目を取得中")
    url=r"https://syllabus.hosei.ac.jp/web/web_search_show.php?search=show&nendo=2025&gakubu="+parse.quote(department)+"&page="+str(page)
    # スマホ版サイトをリクエストす�?
    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) > > AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
        }
    response=requests.get(url,headers=headers)
    soup=BeautifulSoup(response.text,"html.parser")
    rows=soup.select("li.jp")
    return list(map(lambda row:get_class_info(row,department),rows))

DEPARTMENTS = [
    "法学�?,
    "文学�?,
    "経済学部",
    "社会学部",
    "経営学部",
    "国際文化学部",
    "人間環境学部",
    "現代福祉学部",
    "情報科学�?,
    "キャリアデザイン学部",
    "理工学部",
    "生命科学�?,
    "グローバル教養学�?,
    "スポーツ健康学部"
    ]

def main():
    with app.app_context():
        wb=Workbook()
        ws=wb.active
        ws.title="授業一�?
        ws.append(["学部","授業コー�?,"授業�?,"開講時期","曜日","時限","教室�?,"単位�?,"配当年次_最�?,"配当年次_最�?,"シラバスURL","教員�?,"備�?,"エラ�?])
        for i in DEPARTMENTS:
            cnt=1
            while True:
                class_list=get_class_list(i,cnt)
                if len(class_list)==0:
                    print(f"{i}終わ�?) 
                    break
                cnt+=1
                for j in class_list:
                    ws.append([j.department,j.code,j.name,j.season,j.day,j.time,j.place,j.unit,j.grade_min,j.grade_max,j.url,j.teacher,j.note,j.error])
                db.session.commit()
        wb.save("授業一�?xlsx")


if __name__ == "__main__":
    main()
# updated: �����쥤�ԥ� - ����`�ϥ�ɥ�󥰸���
