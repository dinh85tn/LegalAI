import { LegalDocument } from '../types';

// BẠN CÓ THỂ THÊM/SỬA CÁC VĂN BẢN CỐ ĐỊNH TẠI ĐÂY
// Dữ liệu này sẽ được nạp vào kho lưu trữ nếu kho đang trống.

export const DEFAULT_DOCUMENTS: Omit<LegalDocument, 'id' | 'createdAt' | 'category'>[] = [
  {
    title: "Quy định về Biểu giá bán lẻ điện (Mẫu)",
    content: `
THÔNG TƯ QUY ĐỊNH VỀ THỰC HIỆN GIÁ BÁN ĐIỆN

1. Giá bán lẻ điện cho các ngành sản xuất (SXBT):
- Cấp điện áp từ 110 kV trở lên:
  + Giờ bình thường: 1.584 đồng/kWh
  + Giờ thấp điểm: 999 đồng/kWh
  + Giờ cao điểm: 2.844 đồng/kWh
- Cấp điện áp từ 22 kV đến dưới 110 kV:
  + Giờ bình thường: 1.604 đồng/kWh
  + Giờ thấp điểm: 1.037 đồng/kWh
  + Giờ cao điểm: 2.908 đồng/kWh

2. Giá bán lẻ điện cho khối hành chính sự nghiệp (CQHC):
- Bệnh viện, nhà trẻ, mẫu giáo, trường phổ thông (CQBV):
  + Cấp điện áp từ 6 kV trở lên: 1.690 đồng/kWh
  + Cấp điện áp dưới 6 kV: 1.771 đồng/kWh
- Chiếu sáng công cộng; đơn vị hành chính sự nghiệp (CQHC):
  + Cấp điện áp từ 6 kV trở lên: 1.863 đồng/kWh
  + Cấp điện áp dưới 6 kV: 1.940 đồng/kWh

3. Giá bán lẻ điện cho kinh doanh (KDDV):
- Cấp điện áp từ 22 kV trở lên:
  + Giờ bình thường: 2.536 đồng/kWh
  + Giờ thấp điểm: 1.412 đồng/kWh
  + Giờ cao điểm: 4.378 đồng/kWh

4. Giá bán lẻ điện cho sinh hoạt (SHBT):
- Bậc 1: Cho kWh từ 0 - 50: 1.728 đồng/kWh
- Bậc 2: Cho kWh từ 51 - 100: 1.786 đồng/kWh
- Bậc 3: Cho kWh từ 101 - 200: 2.074 đồng/kWh
- Bậc 4: Cho kWh từ 201 - 300: 2.612 đồng/kWh
- Bậc 5: Cho kWh từ 301 - 400: 2.919 đồng/kWh
- Bậc 6: Cho kWh từ 401 trở lên: 3.015 đồng/kWh
    `
  },
  {
    title: "Hướng dẫn xác định đối tượng sử dụng điện",
    content: `
QUY ĐỊNH VỀ ĐỐI TƯỢNG ÁP DỤNG GIÁ ĐIỆN

1. Khách hàng sử dụng điện cho sản xuất (SXBT):
Bao gồm các hoạt động sản xuất công nghiệp, xây dựng, chế biến, gia công sản phẩm hàng hoá, cơ sở chế biến nông lâm thủy sản.

2. Khách hàng sử dụng điện hành chính sự nghiệp (CQHC):
- Đơn vị hành chính sự nghiệp, cơ quan nhà nước.
- Đơn vị lực lượng vũ trang.
- Các tổ chức chính trị - xã hội.
- Chiếu sáng công cộng, công viên.

3. Khách hàng Bệnh viện, trường học (CQBV):
- Nhà trẻ, mẫu giáo, trường phổ thông, trường đại học, cao đẳng.
- Bệnh viện, cơ sở y tế, trạm xá.

4. Khách hàng Kinh doanh dịch vụ (KDDV):
- Các cửa hàng kinh doanh, dịch vụ, siêu thị, hội chợ.
- Cơ sở lưu trú, khách sạn, nhà nghỉ.
- Văn phòng đại diện của các tổ chức kinh doanh.
- Hoạt động ngân hàng, chứng khoán.
    `
  }
];
