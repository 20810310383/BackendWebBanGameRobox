const Gift = require("../../models/Gift");


module.exports = {

    getAllPhanThuong: async (req, res) => {
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
            
            let sp = await Gift.find(query)
                .populate("IdCTV")
                .skip(skip)
                .limit(limitNumber)
                .sort({ [sort]: sortOrder })           

            const totalGift = await Gift.countDocuments(query); // Đếm tổng số chức vụ

            const totalPages = Math.ceil(totalGift / limitNumber); // Tính số trang

            if(sp) {
                return res.status(200).json({
                    message: "Đã tìm ra Gift",
                    errCode: 0,
                    data: sp,
                    totalGift,
                    totalPages,
                    currentPage: pageNumber,
                })
            } else {
                return res.status(500).json({
                    message: "Tìm Gift thất bại!",
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

    createGift: async (req, res) => {
        try {
            let {name, description, linkURLFaceBook, IdCTV, rate} = req.body                                                 

            let createSP = await Gift.create({name, description, linkURLFaceBook, IdCTV, rate})

            if(createSP){
                return res.status(200).json({
                    message: "Bạn đã thêm phần thưởng thành công!",
                    errCode: 0,
                    data: createSP
                })
            } else {
                return res.status(500).json({
                    message: "Bạn thêm phần thưởng thất bại!",                
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

    updateGift: async (req, res) => {
        try {
            let {_id, name, description, linkURLFaceBook, IdCTV, rate} = req.body          

            let updateTL = await Gift.updateOne({_id: _id},{name, description, linkURLFaceBook, IdCTV, rate})

            if(updateTL) {
                return res.status(200).json({
                    data: updateTL,
                    message: "Chỉnh sửa phần thưởng thành công"
                })
            } else {
                return res.status(404).json({                
                    message: "Chỉnh sửa phần thưởng thất bại"
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

    deleteGift: async (req, res) => {
        try {
            const _id = req.params.id
            let xoaTL = await Gift.deleteOne({_id: _id})

            if(xoaTL) {
                return res.status(200).json({
                    data: xoaTL,
                    message: "Bạn đã xoá phần thưởng thành công!"
                })
            } else {
                return res.status(500).json({
                    message: "Bạn đã xoá phần thưởng thất bại!"
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