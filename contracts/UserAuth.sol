// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract UserAuth {
    // 用户角色枚举
    enum Role {
        Unregistered,
        Buyer,
        Seller,
        Admin
    }

    // 用户结构
    struct User {
        address wallet; // 钱包地址
        string name; // 用户名称
        Role role; // 用户角色
        bool isActive; // 账户状态
        uint256 registerTime; // 注册时间
        ApplicationStatus sellerApplication; // 卖家申请状态
    }

    // 存储所有用户信息
    mapping(address => User) public users;

    // 管理员地址
    address public admin;

    // 事件
    event UserRegistered(address indexed wallet, string name, Role role);
    event RoleUpdated(address indexed wallet, Role newRole);
    event UserStatusUpdated(address indexed wallet, bool isActive);

    // 构造函数
    constructor() {
        admin = msg.sender;
        // 注册合约部署者为管理员
        users[msg.sender] = User({
            wallet: msg.sender,
            name: "Admin",
            role: Role.Admin,
            isActive: true,
            registerTime: block.timestamp,
            sellerApplication: ApplicationStatus.None
        });
    }

    // 修饰符：仅管理员
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // 修饰符：仅活跃用户
    modifier onlyActive() {
        require(users[msg.sender].isActive, "User account is not active");
        _;
    }

    // 注册新用户
    function registerUser(string memory _name) public {
        require(
            users[msg.sender].wallet == address(0),
            "User already registered"
        );

        users[msg.sender] = User({
            wallet: msg.sender,
            name: _name,
            role: Role.Buyer, // 默认注册为买家
            isActive: true,
            registerTime: block.timestamp,
            sellerApplication: ApplicationStatus.None
        });

        emit UserRegistered(msg.sender, _name, Role.Buyer);
    }

    // 申请状态枚举
    enum ApplicationStatus {
        None,
        Pending,
        Approved,
        Rejected
    }

    // 新增事件
    event SellerApplicationSubmitted(address indexed wallet);
    event SellerApplicationProcessed(address indexed wallet, bool approved);

    // 申请成为卖家
    function applyForSeller() public onlyActive {
        require(
            users[msg.sender].role == Role.Buyer,
            "User must be a buyer to apply"
        );
        require(
            users[msg.sender].sellerApplication == ApplicationStatus.None ||
            users[msg.sender].sellerApplication == ApplicationStatus.Rejected,
            "Application already submitted or processed"
        );

        users[msg.sender].sellerApplication = ApplicationStatus.Pending;
        emit SellerApplicationSubmitted(msg.sender);
    }

    // 新增：管理员处理卖家申请
    function processSellerApplication(
        address _wallet,
        bool _approved
    ) public onlyAdmin {
        require(
            users[_wallet].sellerApplication == ApplicationStatus.Pending,
            "No pending application"
        );

        if (_approved) {
            users[_wallet].role = Role.Seller;
            users[_wallet].sellerApplication = ApplicationStatus.Approved;
        } else {
            users[_wallet].sellerApplication = ApplicationStatus.Rejected;
        }

        emit SellerApplicationProcessed(_wallet, _approved);
        if (_approved) {
            emit RoleUpdated(_wallet, Role.Seller);
        }
    }

    // 管理员更新用户角色
    function updateUserRole(address _wallet, Role _newRole) public onlyAdmin {
        require(users[_wallet].wallet != address(0), "User not found");
        users[_wallet].role = _newRole;
        emit RoleUpdated(_wallet, _newRole);
    }

    // 管理员更新用户状态
    function updateUserStatus(
        address _wallet,
        bool _isActive
    ) public onlyAdmin {
        require(users[_wallet].wallet != address(0), "User not found");
        users[_wallet].isActive = _isActive;
        emit UserStatusUpdated(_wallet, _isActive);
    }

    // 获取用户信息
    function getUser(address _wallet) public view returns (User memory) {
        return users[_wallet];
    }

    // 检查用户是否为卖家
    function isSeller(address _wallet) public view returns (bool) {
        return users[_wallet].role == Role.Seller && users[_wallet].isActive;
    }

    // 检查用户是否为管理员
    function isAdmin(address _wallet) public view returns (bool) {
        return users[_wallet].role == Role.Admin && users[_wallet].isActive;
    }
}
