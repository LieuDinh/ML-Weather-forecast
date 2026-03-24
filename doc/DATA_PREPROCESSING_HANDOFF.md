# Data Preprocessing Handoff

## 1. Muc tieu

Tai lieu nay mo ta toan bo quy trinh overview, clean data va transform data da duoc thuc hien cho bo du lieu `weather.csv`. Muc tieu cua phase nay la:

- Lam ro chat luong du lieu goc truoc khi model hoa.
- Lam sach du lieu theo dung dac thu chuoi thoi gian da bien, da dia phuong.
- Chuan bi du lieu o dang san sang cho cac nhom phat trien model Random Forest, XGBoost, Prophet va LSTM.

## 2. Tong quan du lieu dau vao

- Nguon du lieu: `weather.csv`
- So dong, so cot ban dau: `181,960 x 10`
- Don vi thoi gian: theo ngay
- Pham vi thoi gian: 2009 den 2021
- Doi tuong quan sat: nhieu tinh/thanh pho tai Viet Nam

### Cac cot du lieu

1. `province`: Tinh/thanh pho ghi nhan du lieu
2. `max`: Nhiet do cao nhat ngay
3. `min`: Nhiet do thap nhat ngay
4. `wind`: Toc do gio
5. `wind_d`: Huong gio
6. `rain`: Luong mua
7. `humidi`: Do am
8. `cloud`: Do che phu may
9. `pressure`: Ap suat khong khi, gia tri quan sat cho thay nhieu kha nang dang o don vi `hPa/mbar`, khong phai `bar`
10. `date`: Ngay ghi nhan

## 3. Ket qua overview

Qua trinh overview xac nhan cac diem chinh sau:

- Khong co dong duplicate hoan toan trong du lieu goc.
- Khong co duplicate theo khoa `province-date` truoc khi chuan hoa ten dia phuong.
- Co tinh trang trung ten dia phuong do khac cach viet: `Hanoi` va `Ha Noi`.
- Co `40` nhan dia phuong bi thieu ngay, tong cong `120` ngay bi khuyet trong chuoi thoi gian.

### Nhan xet

- Voi bai toan time series, viec kiem tra tinh lien tuc cua truc ngay quan trong hon viec chi dem `null` va `duplicate` toan bang.
- Rủi ro lon nhat cua bo du lieu nay khong nam o duplicate dong, ma nam o ten dia phuong khong dong nhat va chuoi ngay bi dut quang.

## 4. Quy trinh clean data

### 4.1. Chuan hoa ten dia phuong

Da thay `Hanoi` bang `Ha Noi` de thong nhat nhan dia phuong.

#### Y nghia

- Neu khong chuan hoa, model co the xem day la hai dia phuong khac nhau.
- Sau khi gop ten, phat sinh `4,549` truong hop duplicate theo khoa `province-date` do hai nhan cu thuc chat cung chi mot dia phuong.

### 4.2. Chuyen `date` sang datetime va dat lam index

Buoc nay duoc thuc hien de:

- Kiem tra tinh lien tuc cua chuoi thoi gian.
- Ho tro noi suy theo truc thoi gian.
- Tach train/test theo thu tu thoi gian, tranh data leakage.

### 4.3. Kiem tra va bo sung ngay bi thieu

Du lieu duoc xu ly theo tung `province` rieng biet:

- Sap xep theo thoi gian.
- Tao day ngay day du tu ngay nho nhat den ngay lon nhat cua tung dia phuong.
- Reindex de bo sung cac ngay con thieu.

### 4.4. Imputation

Chien luoc da ap dung:

- Cot so (`max`, `min`, `wind`, `rain`, `humidi`, `cloud`, `pressure`): noi suy theo thoi gian.
- Cot `wind_d`: dung `ffill()` va `bfill()`.
- Neu mot dia phuong co duplicate index sau khi gop ten: group theo ngay va lay trung binh cho cot so, lay gia tri dau cho cot text.

#### Y nghia

- Noi suy theo tung dia phuong la hop ly vi tranh tron tin hieu khi hau giua cac vung.
- Noi suy theo thoi gian phu hop voi khoang thieu ngan va giup giu chuoi lien tuc cho model.

#### Luu y

- Khong nen xem imputation la tai tao su that cho cac dot thoi tiet cuc doan keo dai.
- Cach nay phu hop cho lam sach va tao bo du lieu baseline, nhung neu sau nay phat hien khoang thieu dai, nhom modeling nen xem xet mot chien luoc dac thu hon.

### 4.5. Kiem dinh gia tri bat thuong

Da kiem tra ca bang thong ke, histogram, boxplot, IQR va business rules.

Ket qua sau lam sach:

- `missing_values_after_cleaning = 0`
- `duplicate_province_date_after_cleaning = 0`
- Khong co gia tri ngoai mien hop ly voi:
  - nhiet do trong `[-10, 50]`
  - `humidi` trong `[0, 100]`
  - `cloud` trong `[0, 100]`
  - `rain >= 0`
  - `pressure > 900`

#### Nhan xet

- Khong nen loai outlier chi vi hiem. Trong bai toan canh bao thoi tiet, gia tri cuc doan co the la tin hieu quan trong can du doan.
- Buoc nay nen duoc hieu la xac minh tinh hop le cua du lieu, khong phai loai toan bo gia tri hiem.

## 5. Quy trinh transform data

### 5.1. Tao dac trung thoi gian

Da tao cac cot:

- `day`
- `month`
- `year`

#### Y nghia

- Ho tro model hoc tinh mua vu va tinh chu ky theo lich.
- Co ich cho ca model tree-based lan neural network.

### 5.2. Nhom dia phuong theo vung khi hau

Da map cac tinh/thanh vao 4 vung lon:

- `Bac Bo`
- `Trung Bo`
- `Tay Nguyen`
- `Nam Bo`

Sau do ma hoa thanh `region_encoded`.

#### Y nghia

- Bo sung thong tin khi hau vi mo ma chi ten tinh don le khong the hien ro.

### 5.3. Ma hoa bien phan loai

Da ma hoa:

- `wind_d` thanh `wind_d_encoded`
- `region` thanh `region_encoded`
- `province` thanh `province_encoded`

#### Y nghia

- Tao bang du lieu co the dua vao pipeline machine learning ma khong con phu thuoc cot text.
- `province_encoded` giup nhom sau loc du lieu theo dia phuong va mo hinh hoa ma khong phai xu ly lai tu dau.

#### Luu y

- Label encoding la cach chuan bi hop ly cho baseline.
- Tuy nhien, day la bien phan loai khong co thu tu. Neu nhom modeling can toi uu Random Forest, XGBoost hoac LSTM, co the xem xet them one-hot encoding hoac embedding cho `province` va `wind_d`.

### 5.4. Loai bo cot text khoi bang modeling

Bang `weather_transformed` sau cung da loai cac cot text:

- `province`
- `wind_d`
- `region`

So chieu bang modeling sau transform: `177,528 x 13`

### 5.5. Tach train/test theo thoi gian

Da tach du lieu theo moc:

- Train: den het `2020-12-31`
- Test: tu `2021-01-01`

Kich thuoc:

- Train: `170,937 x 13`
- Test: `6,591 x 13`

#### Y nghia

- Day la cach tach dung voi bai toan time series, giu nguyen thu tu thoi gian va tranh leakage.

### 5.6. Chuan hoa numeric features

Da thuc hien `MinMaxScaler` tren cac cot so:

- `max_tempeture`
- `min_tempeture`
- `wind`
- `rain`
- `humidi`
- `cloud`
- `pressure`
- `day`
- `month`
- `year`

Nguyen tac ap dung:

- `fit` tren tap train
- `transform` tap train va test bang cung scaler

#### Y nghia

- Dung voi quy tac machine learning de tranh leakage.
- Huu ich dac biet cho LSTM va cac mo hinh nhay voi thang do.
- Random Forest va XGBoost co the dung ca ban scaled hoac unscaled.

## 6. Dau ra da san sang cho nhom model

Da export 4 file:

- `weather_train_2009_2020.csv`: train set da clean/transform, chua scale
- `weather_test_2021.csv`: test set da clean/transform, chua scale
- `weather_train_2009_2020_scaled.csv`: train set da scale
- `weather_test_2021_scaled.csv`: test set da scale

## 7. Danh gia tong the quy trinh hien tai

### Nhung gi da hop ly

- Cac buoc overview, clean data va transform data di dung huong cho bai toan time series weather forecasting.
- Kiem tra tinh lien tuc theo ngay duoc dat dung trong tam.
- Imputation theo tung dia phuong la lua chon hop ly.
- Tach train/test theo thoi gian la dung.
- Da bo sung normalization theo cach khong gay leakage.

### Nhung diem can nhom tiep theo luu y

- Prophet khong dung truc tiep bang hien tai; can tao bang rieng voi cau truc `ds`, `y` cho tung muc tieu du bao.
- Neu nhom muon toi uu model hon baseline, nen xem xet one-hot encoding hoac embedding cho bien phan loai.
- Can xac nhan lai y nghia nghiep vu cua cac target cu the, vi `temperature`, `rain`, `wind` co the can du bao rieng thanh ba bai toan khac nhau.

## 8. Goi y cho phase modeling

### Random Forest, XGBoost

- Co the bat dau tu bo `unscaled`.
- Dung `scaled` neu nhom muon giu mot pipeline dong nhat giua nhieu model.

### LSTM

- Nen uu tien bo `scaled`.
- Can thiet ke lai input thanh cua so thoi gian theo tung dia phuong hoac tung target.

### Prophet

- Nen tach rieng theo tung target va theo tung dia phuong hoac tung cum dia phuong.
- Can chuyen ten cot thanh `ds` va `y`, sau do bo sung regressors neu can.

## 9. Ket luan

Phase cleaning va standardization hien tai da dat muc tieu cua mot quy trinh DA co the ban giao cho nhom model:

- Du lieu da duoc lam sach theo logic thoi gian.
- Da bo sung va noi suy cac ngay thieu mot cach co kiem soat.
- Da ma hoa du lieu phan loai can thiet.
- Da tach train/test dung quy tac time series.
- Da bo sung phien ban chuan hoa cho cac model can scale.

Nhom tiep theo co the su dung truc tiep cac file output de xay dung pipeline du bao cho nhiet do, luong mua va canh bao gio manh.