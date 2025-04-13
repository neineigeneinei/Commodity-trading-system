// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./UserAuth.sol";

contract Market {
    UserAuth private userAuth;

    constructor(address _userAuthAddress) {
        userAuth = UserAuth(_userAuthAddress);
        productIdCounter = 0;
    }

    // 修饰符：仅卖家
    modifier onlySeller() {
        require(
            userAuth.isSeller(msg.sender),
            "Only seller can perform this action"
        );
        _;
    }

    struct Product {
        uint256 id;
        string name;
        uint256 price;
        string mainCategory;
        string subCategory;
        string image;
        uint256 sales;
        address payable seller;
        bool isActive;
    }

    // 商品ID计数器
    uint256 private productIdCounter;

    // 存储所有商品
    mapping(uint256 => Product) public products;

    // 每个卖家的商品列表
    mapping(address => uint256[]) private sellerProducts;

    // 事件
    event ProductListed(
        uint256 indexed productId,
        address indexed seller,
        uint256 price
    );
    event ProductSold(
        uint256 indexed productId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    event ProductUpdated(uint256 indexed productId, uint256 newPrice);
    event ProductRemoved(uint256 indexed productId);

    // 添加新商品
    function listProduct(
        string memory _name,
        uint256 _price,
        string memory _mainCategory,
        string memory _subCategory,
        string memory _image
    ) public returns (uint256) {
        require(_price > 0, "Price must be greater than 0");

        uint256 productId = productIdCounter;
        productIdCounter++;

        products[productId] = Product({
            id: productId,
            name: _name,
            price: _price,
            mainCategory: _mainCategory,
            subCategory: _subCategory,
            image: _image,
            sales: 0,
            seller: payable(msg.sender),
            isActive: true
        });

        sellerProducts[msg.sender].push(productId);

        emit ProductListed(productId, msg.sender, _price);
        return productId;
    }

    // 购买商品
    function buyProduct(uint256 _productId) public payable {
        Product storage product = products[_productId];
        require(product.isActive, "Product is not available");
        require(msg.value == product.price, "Incorrect payment amount");
        require(
            msg.sender != product.seller,
            "Seller cannot buy their own product"
        );

        product.sales++;
        product.seller.transfer(msg.value);

        emit ProductSold(_productId, msg.sender, product.seller, msg.value);
    }

    // 更新商品价格
    function updateProductPrice(uint256 _productId, uint256 _newPrice) public {
        require(_newPrice > 0, "Price must be greater than 0");
        require(
            products[_productId].seller == msg.sender,
            "Only seller can update price"
        );
        require(products[_productId].isActive, "Product is not active");

        products[_productId].price = _newPrice;
        emit ProductUpdated(_productId, _newPrice);
    }

    // 下架商品
    function removeProduct(uint256 _productId) public {
        require(
            products[_productId].seller == msg.sender,
            "Only seller can remove product"
        );
        require(products[_productId].isActive, "Product is already inactive");

        products[_productId].isActive = false;
        emit ProductRemoved(_productId);
    }

    // 获取商品详情
    function getProduct(
        uint256 _productId
    ) public view returns (Product memory) {
        return products[_productId];
    }

    // 获取卖家的所有商品ID
    function getSellerProducts(
        address _seller
    ) public view returns (uint256[] memory) {
        return sellerProducts[_seller];
    }

    // 获取所有活跃商品的数量
    function getActiveProductCount() public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < productIdCounter; i++) {
            if (products[i].isActive) {
                count++;
            }
        }
        return count;
    }
}
