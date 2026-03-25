# Tài liệu Bàn giao Tiền xử lý Dữ liệu

## Tổng quan

Tài liệu này mô tả chi tiết quy trình tiền xử lý dữ liệu thời tiết, bao gồm: tải dữ liệu, làm sạch, biến đổi, xây dựng đặc trưng và phân chia tập huấn luyện/kiểm thử. Mục tiêu là tạo ra các bộ dữ liệu sạch, có cấu trúc và được chuẩn hóa, sẵn sàng cho các mô hình học máy (XGBoost, LSTM, Prophet, v.v.).

---

## 1. Tải dữ liệu

**Đường dẫn tệp:** `dataset/init/weather.csv`

**Các cột (dữ liệu thô):**
| Cột | Mô tả | Kiểu dữ liệu |
|-----|-------|--------------|
| province | Tên tỉnh/thành phố | object |
| max | Nhiệt độ tối đa hàng ngày (°C) | int64 |
| min | Nhiệt độ tối thiểu hàng ngày (°C) | int64 |
| wind | Tốc độ gió (km/h) | int64 |
| wind_d | Hướng gió | object |
| rain | Lượng mưa (mm) | float64 |
| humidi | Độ ẩm (%) | int64 |
| cloud | Độ che phủ mây (%) | int64 |
| pressure | Áp suất không khí (hPa) | int64 |
| date | Ngày (yyyy-mm-dd) | object |

**Kích thước ban đầu:** `(181.960, 10)`

**Nhận xét:** Dữ liệu ban đầu không có giá trị thiếu, nhưng tồn tại các dòng trùng lặp và tên tỉnh không đồng nhất.

---

## 2. Làm sạch dữ liệu

### 2.1 Chuẩn hóa tên tỉnh
- **Hành động:** Thay `'Hanoi'` thành `'Ha Noi'` để đồng nhất tên.
- **Kết quả:** Số tỉnh duy nhất giảm từ 40 xuống 39.
- **Lý do:** Đảm bảo nhóm dữ liệu nhất quán khi phân tích không gian.

### 2.2 Chuyển đổi cột ngày và đặt chỉ mục
- Chuyển cột `date` sang định dạng datetime.
- Đặt `date` làm chỉ mục của DataFrame.
- Kiểm tra khoảng thời gian: `2009-01-01` đến `2021-06-18`.

### 2.3 Xử lý ngày thiếu (Nội suy)

**Vấn đề:** Một số tỉnh có ngày thiếu (mỗi tỉnh thiếu 3 ngày, 40 tỉnh bị ảnh hưởng → tổng 120 ngày thiếu).

**Xử lý theo từng tỉnh:**
1. **Sắp xếp** dữ liệu theo ngày.
2. **Loại bỏ các ngày trùng lặp** (nếu có) bằng cách tổng hợp:
   - Cột số: lấy giá trị trung bình
   - Cột phân loại: lấy giá trị đầu tiên
3. **Đánh lại chỉ mục** để có đầy đủ các ngày từ min đến max (theo tần suất ngày).
4. **Điền giá trị thiếu:**
   - Cột số (`max`, `min`, `wind`, `rain`, `humidi`, `cloud`, `pressure`): nội suy tuyến tính theo thời gian (`method='time'`).
   - Hướng gió (`wind_d`): điền tiếp về phía trước, sau đó điền ngược.
5. **Chuyển giá trị nội suy về số nguyên** đối với các cột vốn là số nguyên.

**Kết quả:**
- Không còn giá trị thiếu.
- Kích thước cuối cùng: `(177.528, 9)` sau khi thêm các ngày thiếu.

### 2.4 Đổi tên cột
- `max` → `max_temp`
- `min` → `min_temp`
- **Lý do:** Dễ hiểu và nhất quán.

### 2.5 Xây dựng đặc trưng: Chênh lệch nhiệt độ
- Thêm cột `temp_diff = max_temp - min_temp`
- Dùng để ghi nhận biến động nhiệt độ hàng ngày.

### 2.6 Phát hiện ngoại lệ (Phương pháp IQR)

| Cột | Số lượng ngoại lệ | Tỷ lệ |
|-----|-------------------|-------|
| max_temp | 8.087 | 4,56% |
| min_temp | 9.751 | 5,49% |
| temp_diff | 5.633 | 3,17% |
| wind | 4.218 | 2,38% |
| rain | 16.638 | 9,37% |
| humidi | 2.214 | 1,25% |
| cloud | 0 | 0,00% |
| pressure | 13.541 | 7,63% |

**Quyết định:** **Giữ nguyên tất cả các giá trị ngoại lệ.**  
**Lý do:** Các ngoại lệ phản ánh các sự kiện thời tiết cực đoan thực tế (bão, mưa lớn). Việc loại bỏ chúng sẽ làm mất đi tín hiệu mà các mô hình cần để dự đoán các điều kiện khắc nghiệt. Việc chuẩn hóa (MinMaxScaler) sau đó sẽ thu nhỏ các giá trị về khoảng [0,1] mà không làm mất chúng.

### 2.7 Kiểm tra hợp lệ dữ liệu (Quy tắc nghiệp vụ)

**Các quy tắc được kiểm tra:**
- Nhiệt độ tối đa: `-10 ≤ max_temp ≤ 50`
- Nhiệt độ tối thiểu: `-10 ≤ min_temp ≤ 50`
- Chênh lệch nhiệt độ: `≥ 0`
- Độ ẩm: `0 ≤ humidi ≤ 100`
- Độ che phủ mây: `0 ≤ cloud ≤ 100`
- Lượng mưa: `≥ 0`
- Áp suất: `> 900`

**Kết quả:** Tất cả dữ liệu đều thỏa mãn. Không có giá trị nằm ngoài khoảng cho phép.

---

## 3. Biến đổi dữ liệu

### 3.1 Trích xuất đặc trưng thời gian
- Thêm các cột `day`, `month`, `year` từ chỉ mục `date`.
- **Mục đích:** Ghi nhận tính mùa vụ và chu kỳ cho các mô hình chuỗi thời gian.

### 3.2 Phân nhóm vùng khí hậu

**Bảng ánh xạ:**
| Vùng | Các tỉnh |
|------|----------|
| Bắc Bộ | Hoa Binh, Hong Gai, Thai Nguyen, Cam Pha, Nam Dinh, Uong Bi, Viet Tri, Ha Noi, Hai Duong, Yen Bai, Hai Phong |
| Trung Bộ | Tam Ky, Hue, Thanh Hoa, Tuy Hoa, Cam Ranh, Nha Trang, Phan Rang, Vinh, Phan Thiet, Qui Nhon |
| Tây Nguyên | Buon Me Thuot, Da Lat, Play Cu |
| Nam Bộ | Bac Lieu, Ho Chi Minh City, Ben Tre, Tan An, Bien Hoa, Ca Mau, Long Xuyen, Tra Vinh, My Tho, Can Tho, Chau Doc, Vinh Long, Vung Tau, Rach Gia, Soc Trang |

**Quy trình:**
1. Tạo ánh xạ ngược `tỉnh → vùng`.
2. Thêm cột `region`.
3. Mã hóa nhãn `region` → `region_encoded` (0, 1, 2, 3).

### 3.3 Mã hóa tỉnh
- Mã hóa nhãn `province` → `province_encoded`.
- Xuất tệp ánh xạ: `dataset/province_region_code_mapping.csv` (chứa tên tỉnh, vùng và mã số tương ứng).

### 3.4 Mã hóa hướng gió
- Mã hóa nhãn `wind_d` → `wind_d_encoded`.

### 3.5 Tập dữ liệu sạch cuối cùng

**Các cột sau khi biến đổi (14 cột):**
- Số: `max_temp`, `min_temp`, `wind`, `rain`, `humidi`, `cloud`, `pressure`, `temp_diff`, `day`, `month`, `year`
- Phân loại đã mã hóa: `region_encoded`, `province_encoded`, `wind_d_encoded`

**Các cột đã loại bỏ:** `province` (văn bản), `wind_d` (văn bản), `region` (văn bản)

---

## 4. Phân chia tập huấn luyện / kiểm thử (theo thời gian)

**Mốc phân chia:** `2021-01-01`

| Tập dữ liệu | Khoảng thời gian | Số dòng |
|-------------|------------------|---------|
| Huấn luyện | 2009-01-01 đến 2020-12-31 | 170.937 |
| Kiểm thử | 2021-01-01 đến 2021-06-18 | 6.591 |

**Lưu ý:** Phân chia được thực hiện trước khi chuẩn hóa để tránh rò rỉ dữ liệu.

---

## 5. Chuẩn hóa (MinMaxScaler)

**Các cột được chuẩn hóa:**
- `max_temp`, `min_temp`, `temp_diff`, `wind`, `rain`, `humidi`, `cloud`, `pressure`, `day`, `month`, `year`

**Quy trình:**
1. Khớp bộ chuẩn hóa **chỉ trên tập huấn luyện**.
2. Chuyển đổi cả tập huấn luyện và kiểm thử.
3. Khoảng giá trị sau chuẩn hóa: `[0, 1]` cho tất cả các cột được chọn.

**Lý do:** Dữ liệu chuẩn hóa phù hợp với LSTM và các mô hình dựa trên gradient; các mô hình dạng cây (XGBoost, Random Forest) vẫn có thể dùng dữ liệu gốc.

---

## 6. Các tệp dữ liệu xuất ra

### Không chuẩn hóa (dành cho XGBoost, Random Forest)
- `dataset/test_train/weather_train_2009_2020.csv`
- `dataset/test_train/weather_test_2021.csv`

### Đã chuẩn hóa (dành cho LSTM, deep learning)
- `dataset/test_train_scaled/weather_train_2009_2020_scaled.csv`
- `dataset/test_train_scaled/weather_test_2021_scaled.csv`

**Sắp xếp:** Tất cả các tệp xuất ra được sắp xếp theo `province_encoded` (tăng dần) sau đó đến `date` (tăng dần) để giữ chuỗi thời gian của từng tỉnh liên tục.

---

## 7. Kiểm tra đảm bảo chất lượng (QA)

| Kiểm tra | Kết quả |
|----------|---------|
| Kích thước dữ liệu thô | (181.960, 10) |
| Kích thước dữ liệu sạch | (177.528, 17) |
| Kích thước dữ liệu đã biến đổi | (177.528, 14) |
| Kích thước tập huấn luyện | (170.937, 14) |
| Kích thước tập kiểm thử | (6.591, 14) |
| Số dòng trùng lặp chính xác trong dữ liệu thô | 0 |
| Số dòng trùng lặp (tỉnh, ngày) trong dữ liệu thô | 0 |
| Số dòng trùng lặp (tỉnh, ngày) sau khi hợp nhất tên | 4.549 (do xung đột Hanoi/Ha Noi) |
| Số tỉnh có ngày thiếu trước khi nội suy | 40 |
| Tổng số ngày thiếu trước khi nội suy | 120 |
| Số tỉnh duy nhất sau khi làm sạch | 39 |
| Số dòng trùng lặp (tỉnh, ngày) sau khi làm sạch | 0 |
| Giá trị thiếu sau khi làm sạch | 0 |
| Giá trị thiếu cột vùng sau khi ánh xạ | 0 |
| Còn cột tỉnh (văn bản) trong bảng mô hình | Không |
| Cột chênh lệch nhiệt độ tồn tại | Có |
| Nhiệt độ tối đa ngoài [-10, 50] | 0 |
| Nhiệt độ tối thiểu ngoài [-10, 50] | 0 |
| Chênh lệch nhiệt độ âm | 0 |
| Độ ẩm ngoài [0, 100] | 0 |
| Độ che phủ mây ngoài [0, 100] | 0 |
| Lượng mưa âm | 0 |
| Áp suất ≤ 900 | 0 |

---

## 8. Ghi chú cho quá trình phát triển mô hình

### Đối với LSTM (và các mô hình chuỗi khác)
- Sử dụng **dữ liệu đã chuẩn hóa**.
- Đảm bảo thứ tự thời gian được giữ nguyên (đã sắp xếp theo `province_encoded` và `date`).
- Xem xét việc định dạng lại dữ liệu thành các chuỗi theo từng tỉnh để đưa vào LSTM.

### Đối với XGBoost / Random Forest
- Sử dụng **dữ liệu chưa chuẩn hóa**; các mô hình này không bị ảnh hưởng bởi tỷ lệ.
- Đưa `province_encoded`, `region_encoded`, `wind_d_encoded` vào như các đặc trưng phân loại.
- `day`, `month`, `year` có thể được dùng như các đặc trưng số.

### Đối với Prophet
- Người xây dựng mô hình nên tạo các bảng riêng cho từng tỉnh với:
  - `ds`: cột ngày
  - `y`: biến mục tiêu (ví dụ: max_temp, min_temp, rain)
  - Các biến ngoại sinh bổ sung nếu cần.

### Xử lý ngoại lệ
- Tất cả các ngoại lệ được giữ nguyên. Nếu mô hình nhạy cảm với các giá trị cực trị, có thể cân nhắc sử dụng chuẩn hóa vững (robust scaling) hoặc cắt bớt trong khi xây dựng mô hình, nhưng cần đánh giá tác động đến khả năng dự đoán các sự kiện cực đoan.

---

## 9. Tóm tắt các tệp đầu ra

| Đường dẫn tệp | Mô tả |
|---------------|-------|
| `dataset/province_region_code_mapping.csv` | Ánh xạ giữa tên tỉnh, vùng miền và mã số mã hóa |
| `dataset/test_train/weather_train_2009_2020.csv` | Dữ liệu huấn luyện chưa chuẩn hóa |
| `dataset/test_train/weather_test_2021.csv` | Dữ liệu kiểm thử chưa chuẩn hóa |
| `dataset/test_train_scaled/weather_train_2009_2020_scaled.csv` | Dữ liệu huấn luyện đã chuẩn hóa |
| `dataset/test_train_scaled/weather_test_2021_scaled.csv` | Dữ liệu kiểm thử đã chuẩn hóa |

---

**Thời gian hoàn thành tiền xử lý:** 2026-03-25  
**Nguồn dữ liệu:** `dataset/init/weather.csv`  
**Dữ liệu sẵn sàng cho:** Phát triển và đánh giá mô hình