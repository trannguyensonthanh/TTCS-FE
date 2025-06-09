// src/components/enums/loaiThongBao.enum.js
const LoaiThongBao = Object.freeze({
  SU_KIEN_MOI_CHO_DUYET_BGH: 'SU_KIEN_MOI_CHO_DUYET_BGH', // Gửi BGH
  SU_KIEN_DA_DUYET_BGH: 'SU_KIEN_DA_DUYET_BGH', // Gửi người tạo
  SU_KIEN_BI_TU_CHOI_BGH: 'SU_KIEN_BI_TU_CHOI_BGH', // Gửi người tạo
  YC_PHONG_MOI_CHO_CSVC: 'YC_PHONG_MOI_CHO_CSVC', // Gửi CSVC
  YC_PHONG_DA_DUYET_CSVC: 'YC_PHONG_DA_DUYET_CSVC', // Gửi người yêu cầu phòng
  YC_PHONG_BI_TU_CHOI_CSVC: 'YC_PHONG_BI_TU_CHOI_CSVC', // Gửi người yêu cầu phòng
  YC_HUY_SK_MOI_CHO_BGH: 'YC_HUY_SK_MOI_CHO_BGH', // Gửi BGH
  YC_HUY_SK_DA_DUYET: 'YC_HUY_SK_DA_DUYET', // Gửi người yêu cầu hủy
  YC_HUY_SK_BI_TU_CHOI: 'YC_HUY_SK_BI_TU_CHOI', // Gửi người yêu cầu hủy
  PHONG_DA_GIAI_PHONG_DO_HUY_SK: 'PHONG_DA_GIAI_PHONG_DO_HUY_SK', // Thông báo cho CSVC
  SK_SAP_DIEN_RA: 'SK_SAP_DIEN_RA', // Gửi người tham gia/được mời
  THONG_BAO_CHUNG: 'THONG_BAO_CHUNG',
  SU_KIEN_TU_DONG_HUY_QUA_HAN: 'SU_KIEN_TU_DONG_HUY_QUA_HAN', // Tự động hủy sự kiện quá hạn
  SU_KIEN_NHAC_NHO_DUYET_BGH: 'SU_KIEN_NHAC_NHO_DUYET_BGH', // Nhắc nhở BGH duyệt sự kiện
  YC_PHONG_NHAC_NHO_DUYET_CSVC: 'YC_PHONG_NHAC_NHO_DUYET_CSVC', // Nhắc nhở CSVC duyệt yêu cầu phòng
  BGH_YEU_CAU_CHINH_SUA_SK: 'BGH_YEU_CAU_CHINH_SUA_SK', // BGH yêu cầu chỉnh sửa Sự kiện
  CSVC_YEU_CAU_CHINH_SUA_YCPCT: 'CSVC_YEU_CAU_CHINH_SUA_YCPCT', // CSVC yêu cầu chỉnh sửa Yêu cầu
  // Thêm các loại khác nếu cần
});

export default LoaiThongBao;
