"""Bouwt src/assets/data/hourly-2025.json uit openbare bronnen (NEDU/MFFBAS, PVGIS, EnergyZero/EPEX).
Gebruik: python3 data-build/build_hourly.py  (schrijft naar src/assets/data/hourly-2025.json)"""
import csv, json, datetime as dt, urllib.request, calendar, time, io, zipfile, os, hashlib
UTC=dt.timezone.utc
Y=2025
start=dt.datetime(Y,1,1,tzinfo=UTC)
N=8760
# --- load profile (NEDU/MFFBAS E1A AZI A) ---
load=[0.0]*N
NEDU_ZIP="https://energiedatawijzer.nl/app/uploads/Documenten/Profielen/Profielen/Profielen-elektriciteit-2025-v1.00-incl.-verslag.zip"
def get(u, tries=4, **kw):
    for i in range(tries):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=120).read()
        except Exception as e:
            if i==tries-1: raise
            time.sleep(5*(i+1))
zf=zipfile.ZipFile(io.BytesIO(get(NEDU_ZIP)))
with zf.open("Standaardprofielen elektriciteit 2025 versie 1.00.csv") as raw:
    fh=io.TextIOWrapper(raw,encoding="latin-1")
    r=csv.reader(fh,delimiter=";")
    hdr=None
    for row in r:
        if len(row)>3 and row[2]=="Versienr": hdr=row; ci=row.index("1.00_E1A_AZI_A"); continue
        if not row or not row[0][:4].isdigit(): continue
        end_utc1=dt.datetime.strptime(row[0],"%Y-%m-%d %H:%M").replace(tzinfo=UTC)-dt.timedelta(hours=1)
        st=end_utc1-dt.timedelta(minutes=15)
        h=int((st-start).total_seconds()//3600)
        if 0<=h<N: load[h]+=float(row[ci])
s=sum(load); load=[x/s for x in load]
print("load sum",s, "max",max(load)*s)
# --- PV: PVGIS hourly avg 2018-2023 De Bilt, 1 kWp, 35deg south, 14% loss ---
acc=[0.0]*N; cnt=[0]*N
for yr in range(2018,2024):
    u=f"https://re.jrc.ec.europa.eu/api/v5_3/seriescalc?lat=52.10&lon=5.18&peakpower=1&loss=14&angle=35&aspect=0&pvcalculation=1&startyear={yr}&endyear={yr}&outputformat=json"
    d=json.loads(get(u))
    for rec in d["outputs"]["hourly"]:
        t=dt.datetime.strptime(rec["time"],"%Y%m%d:%H%M")
        if t.month==2 and t.day==29: continue
        doy=(dt.datetime(Y,t.month,t.day)-dt.datetime(Y,1,1)).days
        h=doy*24+t.hour
        acc[h]+=rec["P"]/1000.0; cnt[h]+=1
    time.sleep(1)
pv=[a/c if c else 0 for a,c in zip(acc,cnt)]
print("pv kWh/kWp",sum(pv))
# --- EPEX NL day-ahead 2025 via EnergyZero (excl btw, EUR/kWh) ---
price=[None]*N
for m in range(1,13):
    last=calendar.monthrange(Y,m)[1]
    a=dt.datetime(Y,m,1,tzinfo=UTC)-dt.timedelta(hours=2); b=dt.datetime(Y,m,last,23,59,59,tzinfo=UTC)+dt.timedelta(hours=2)
    u=f"https://api.energyzero.nl/v1/energyprices?fromDate={a.strftime('%Y-%m-%dT%H:%M:%S.000Z')}&tillDate={b.strftime('%Y-%m-%dT%H:%M:%S.999Z')}&interval=4&usageType=1&inclBtw=false"
    d=json.loads(get(u))
    for p in d["Prices"]:
        t=dt.datetime.strptime(p["readingDate"][:19],"%Y-%m-%dT%H:%M:%S").replace(tzinfo=UTC)
        h=int((t-start).total_seconds()//3600)
        if 0<=h<N: price[h]=p["price"]
    time.sleep(0.5)
miss=[i for i,x in enumerate(price) if x is None]
print("missing prices",len(miss))
for i in miss: price[i]=price[i-1] if i>0 and price[i-1] is not None else 0.0
avg=sum(price)/N; wsolar=sum(p*q for p,q in zip(price,pv))/sum(pv); wload=sum(p*q for p,q in zip(price,load))
print("avg epex",avg,"solar-weighted",wsolar,"load-weighted",wload, "neg hours",sum(1 for p in price if p<0))
out={"meta":{"year":Y,"tz":"UTC","hours":N,
 "load":"MFFBAS/NEDU standaardprofiel E1A (AZI, afname) 2025 v1.00, kwartierwaarden opgeteld per uur, genormaliseerd naar som 1",
 "pv":"PVGIS v5.3 (EU JRC) uurreeks De Bilt 52.10N 5.18E, 1 kWp, 35 graden zuid, 14% systeemverlies, gemiddelde 2018-2023 per uur van het jaar",
 "price":"EPEX day-ahead NL 2025 per uur, excl. btw, EUR/kWh, via api.energyzero.nl",
 "pvKwhPerKwp":round(sum(pv),1),"epexAvg":round(avg,5),"epexSolarWeighted":round(wsolar,5),"epexLoadWeighted":round(wload,5)},
 "load":[round(x*1e6) for x in load],  # millionths
 "pv":[round(x*1000) for x in pv],     # Wh per kWp
 "price":[round(x*1e4) for x in price] # 0.1 cent units -> /1e4 EUR
}
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","src","assets","data","hourly-2025.json")
os.makedirs(os.path.dirname(OUT),exist_ok=True)
json.dump(out,open(OUT,"w"),separators=(",",":"))
print("sha256",hashlib.sha256(open(OUT,"rb").read()).hexdigest())
