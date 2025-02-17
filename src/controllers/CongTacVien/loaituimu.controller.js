const { default: mongoose } = require("mongoose");
const BagType = require("../../models/BagType");

module.exports = {

    getAllBagType: async (req, res) => {
        try {
            const { page, limit, name, sort, order, IdCTV, isEqualIdCTV } = req.query; 

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            // Tính toán số bản ghi bỏ qua
            const skip = (pageNumber - 1) * limitNumber;

            // Tạo query tìm kiếm
            const query = {};
            if (name) {
                const searchKeywords = name.trim().split(/\s+/).map(keyword => {
                    // Chuyển keyword thành regex để tìm kiếm gần đúng (không phân biệt chữ hoa chữ thường)
                    const normalizedKeyword = keyword.toLowerCase();  // Chuyển tất cả về chữ thường để không phân biệt
                    return {
                        name: { $regex: normalizedKeyword, $options: 'i' } // 'i' giúp tìm kiếm không phân biệt chữ hoa chữ thường
                    };
                });
            

                query.$or = searchKeywords;
            }
                 
            if(IdCTV) {
                query.IdCTV = IdCTV;
            }
            
            // tang/giam
            let sortOrder = 1; // tang dn
            if (order === 'desc') {
                sortOrder = -1; 
            }                       

            // query.isActive = isActive
            
            let sp = await BagType.find(query)
                .populate("IdCTV")
                .populate({
                    path: "prizePool.gift",
                    model: "Gift",
                })
                .skip(skip)
                .limit(limitNumber)
                .sort({ [sort]: sortOrder })           

            const totalBagType = await BagType.countDocuments(query); // Đếm tổng số chức vụ

            const totalPages = Math.ceil(totalBagType / limitNumber); // Tính số trang

            if(sp) {
                return res.status(200).json({
                    message: "Đã tìm ra BagType",
                    errCode: 0,
                    data: sp,
                    totalBagType,
                    totalPages,
                    currentPage: pageNumber,
                })
            } else {
                return res.status(500).json({
                    message: "Tìm BagType thất bại!",
                    errCode: -1,
                })
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }        
    },

    createBagType: async (req, res) => {
        try {
            let {name, price, description, winningRate, stock, IdCTV, prizePool} = req.body                                                 

            let formattedPrizePool = prizePool.map(id => ({ gift: new mongoose.Types.ObjectId(id) }));

            let createSP = await BagType.create({name, price, description, winningRate, stock, IdCTV, prizePool: formattedPrizePool})

            if(createSP){
                return res.status(200).json({
                    message: "Bạn đã thêm loại túi thành công!",
                    errCode: 0,
                    data: createSP
                })
            } else {
                return res.status(500).json({
                    message: "Bạn thêm loại túi thất bại!",                
                    errCode: -1,
                })
            }    

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }        
    },

    updateBagType: async (req, res) => {
        try {
            let {_id, name, price, description, winningRate, stock, IdCTV, prizePool} = req.body          

            // Chuyển đổi prizePool thành mảng object { gift: ObjectId }
            let formattedPrizePool = prizePool.map(id => ({ gift: new mongoose.Types.ObjectId(id) }));

            let updateTL = await BagType.updateOne({_id: _id},{name, price, description, winningRate, stock, IdCTV, prizePool: formattedPrizePool})

            if(updateTL) {
                return res.status(200).json({
                    data: updateTL,
                    message: "Chỉnh sửa loại túi thành công"
                })
            } else {
                return res.status(404).json({                
                    message: "Chỉnh sửa loại túi thất bại"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }
    },

    deleteBagType: async (req, res) => {
        try {
            const _id = req.params.id
            let xoaTL = await BagType.deleteOne({_id: _id})

            if(xoaTL) {
                return res.status(200).json({
                    data: xoaTL,
                    message: "Bạn đã xoá loại túi thành công!"
                })
            } else {
                return res.status(500).json({
                    message: "Bạn đã xoá loại túi thất bại!"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }
    }, 

}