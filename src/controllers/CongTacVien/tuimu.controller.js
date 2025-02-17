const AccKH = require("../../models/AccKH");
const BagType = require("../../models/BagType");
const CongTacVien = require("../../models/CongTacVien");
const Gift = require("../../models/Gift");
const LichSuMuaTuiMu = require("../../models/LichSuMuaTuiMu");


module.exports = {

    muaTui: async (req, res) => {
        try {
            const { customer, quantity, IdLoaiTui } = req.body;
    
            // Tìm loại túi theo ID
            const bagTypeRecord = await BagType.findById(IdLoaiTui)
            .populate({
                path: "prizePool.gift",
                model: "Gift",
            })
            if (!bagTypeRecord) {
                return res.status(404).json({ message: "Loại túi không tồn tại" });
            }
    
            const price = bagTypeRecord.price;
            const winningRate = bagTypeRecord.winningRate / 100;
    
            if (bagTypeRecord.stock < quantity) {
                return res.status(400).json({ message: "Không đủ số lượng túi để mua" });
            }
    
            let results = [];
    
            // Tính tổng tỷ lệ các quà
            let totalGiftRate = bagTypeRecord.prizePool.reduce((sum, prize) => sum + prize.gift.rate, 0);

            for (let i = 0; i < quantity; i++) {
                let isWinner = Math.random() < winningRate; // Xác suất trúng theo túi
                let selectedGift = null;

                if (isWinner && bagTypeRecord.prizePool.length > 0) {
                    let randomValue = Math.random() * totalGiftRate; // Random trong khoảng tổng rate
                    let cumulativeRate = 0;

                    for (const prize of bagTypeRecord.prizePool) {
                        cumulativeRate += prize.gift.rate; // Cộng dồn tỉ lệ quà
                        if (randomValue < cumulativeRate) {
                            selectedGift = prize.gift; // Chọn quà theo tỉ lệ
                            break;
                        }
                    }
                }

                results.push({
                    bagId: i + 1,
                    isWinner,
                    name: selectedGift ? selectedGift.name : "Không có quà",
                    description: selectedGift ? selectedGift.description : "Không có mô tả",
                    IdGift: selectedGift ? selectedGift._id : null,
                });

                console.log(`Bag ${i + 1}: Winner=${isWinner}, Gift=${selectedGift ? selectedGift.name : "NULL"}`);
            }

                                
    
            await BagType.findByIdAndUpdate(
                bagTypeRecord._id,
                { $inc: { stock: -quantity } },
                { new: true }
            );
    
            let kh = await AccKH.findById(customer);
            const totalPrice = quantity * price;
    
            if (!kh) {
                return res.status(404).json({
                    message: "Khách hàng không tồn tại",
                    errCode: 3
                });
            }
            if (kh.soDu < totalPrice) {
                return res.status(404).json({
                    message: "Số dư không đủ, vui lòng nạp thêm!",
                    errCode: 4
                });
            }
    
            let soDuUpdate = Math.floor(kh.soDu - totalPrice);
            await CongTacVien.findByIdAndUpdate(
                { _id: bagTypeRecord.IdCTV },
                { $inc: { soDu: totalPrice } },
                { new: true }
            );
    
            kh = await AccKH.findByIdAndUpdate(
                { _id: customer },
                { soDu: soDuUpdate },
                { new: true }
            );
    
            const purchaseRecord = new LichSuMuaTuiMu({
                customer,
                bagType: bagTypeRecord._id,
                quantity,
                totalPrice,
                results,
                IdCTV: bagTypeRecord.IdCTV
            });
            await purchaseRecord.save();
    
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
    

    muaTui1: async (req, res) => {
        try {
            // Dữ liệu từ client: customer, bagType (ID của loại túi) và quantity
            const { customer, quantity, IdLoaiTui } = req.body;
            
            // Tìm loại túi theo ID
            const bagTypeRecord = await BagType.findOne({_id: IdLoaiTui});
            // const bagTypeRecord = await BagType.findById(bagType);
            if (!bagTypeRecord) {
                return res.status(404).json({ message: "Loại túi không tồn tại" });
            }
            
            const price = bagTypeRecord.price;
            const winningRate = bagTypeRecord.winningRate / 100;
            console.log("price: ", price);
            console.log("winningRate: ", winningRate);

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
                let idGift = null;
                if (isWinner) {
                    // Chọn ngẫu nhiên một quà từ kho (nếu có)
                    const gifts = await Gift.find({IdCTV: bagTypeRecord.IdCTV});
                    if (gifts.length > 0) {
                        const randomIndex = Math.floor(Math.random() * gifts.length);
                        name = gifts[randomIndex].name;
                        description = gifts[randomIndex].description;
                        idGift = gifts[randomIndex]._id;
                    }
                }
                results.push({
                    bagId: i + 1,
                    isWinner,
                    name,
                    description,
                    IdGift: idGift
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
            
            let soDuUpdate = Math.floor(kh.soDu - totalPrice);
            console.log("soDuUpdate: ", soDuUpdate);
            

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
                IdCTV: bagTypeRecord.IdCTV
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