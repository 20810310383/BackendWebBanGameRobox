const AccKH = require("../../models/AccKH");
const BagType = require("../../models/BagType");
const CongTacVien = require("../../models/CongTacVien");
const Gift = require("../../models/Gift");
const LichSuMuaTuiMu = require("../../models/LichSuMuaTuiMu");


module.exports = {

    muaTui: async (req, res) => {
        try {
            // Dữ liệu từ client: customer, bagType (ID của loại túi) và quantity
            const { customer, quantity, IdCTV } = req.body;
            
            // Tìm loại túi theo ID
            const bagTypeRecord = await BagType.findOne({IdCTV: IdCTV});
            // const bagTypeRecord = await BagType.findById(bagType);
            if (!bagTypeRecord) {
                return res.status(404).json({ message: "Loại túi không tồn tại" });
            }
            
            const price = bagTypeRecord.price;
            const winningRate = bagTypeRecord.winningRate / 100;

            // Kiểm tra số lượng tồn
            if (bagTypeRecord.stock < quantity) {
                return res.status(400).json({ message: "Không đủ số lượng túi để mua" });
            }
            
            let results = [];
            // Xử lý từng túi: xác định ngẫu nhiên trúng thưởng hay không
            for (let i = 0; i < quantity; i++) {
                const isWinner = Math.random() < winningRate;
                let name = null;
                let description = null;
                if (isWinner) {
                    // Chọn ngẫu nhiên một quà từ kho (nếu có)
                    const gifts = await Gift.find({IdCTV: bagTypeRecord.IdCTV});
                    if (gifts.length > 0) {
                        const randomIndex = Math.floor(Math.random() * gifts.length);
                        name = gifts[randomIndex].name;
                        description = gifts[randomIndex].description;
                    }
                }
                results.push({
                    bagId: i + 1,
                    isWinner,
                    name,
                    description
                });
            }

            // Trừ số lượng tồn trong BagType
            await BagType.findByIdAndUpdate(
                bagTypeRecord._id,
                { $inc: { stock: -quantity } },
                { new: true }
            );
            
            let kh = await AccKH.findById(customer);

            // Tính tổng tiền
            const totalPrice = quantity * price;
            let soDuUpdate = Math.floor(kh.soDu - totalPrice);

            if (!kh) {
                return res.status(404).json({
                    message: "Khách hàng không tồn tại",
                    errCode: 3
                });
            }  
            if (kh.soDu < totalPrice) {
                return res.status(404).json({
                    message: "Số dư không đủ để mua hàng, Vui lòng nạp thêm vào tài khoản để mua hàng!",
                    errCode: 4
                });
            }              

            // lưu số dư cho ctv
            let timCTV = await CongTacVien.findByIdAndUpdate(
                {_id: bagTypeRecord.IdCTV},
                { $inc: { soDu: totalPrice } },
                {new: true}
            );

            // trừ số dư cho ctv
            kh = await AccKH.findByIdAndUpdate(
                {_id: customer},
                {soDu: soDuUpdate},
                {new: true}
            );
            
            // Lưu thông tin giao dịch mua
            const purchaseRecord = new LichSuMuaTuiMu({
                customer,
                bagType: bagTypeRecord._id,
                quantity,
                totalPrice,
                results,
            });
            await purchaseRecord.save();
            
            // Trả về kết quả, bao gồm IdCTV của loại túi để xử lý cộng số dư cho cộng tác viên
            return res.status(200).json({
                data: {
                    bagType: bagTypeRecord.name,
                    quantity,
                    price,
                    totalPrice,
                    results,
                    IdCTV: bagTypeRecord.IdCTV,
                },
            });
            } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    },    
}