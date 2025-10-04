/**
 *Submitted for verification at BscScan.com on 2025-08-31
*/

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(_msgSender(), spender, currentAllowance - subtractedValue);
        }
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Transfer amount must be greater than zero");

        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
}

abstract contract Ownable is Context {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        _transferOwnership(initialOwner);
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

interface IDexRouter {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (
        uint256 amountToken,
        uint256 amountETH,
        uint256 liquidity
    );
}

interface IDexFactory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

contract EVANA is ERC20, Ownable, ReentrancyGuard {
    // Constants
    uint256 private constant TOTAL_SUPPLY = 10_000_000_000 * 1e18; // 10 billion tokens
    uint256 private constant MAX_FEE = 30; // Maximum fee percentage
    uint256 private constant MIN_MAX_BUY = TOTAL_SUPPLY * 1 / 1000; // 0.1% minimum
    uint256 private constant MIN_MAX_SELL = TOTAL_SUPPLY * 1 / 1000; // 0.1% minimum
    uint256 private constant MIN_MAX_WALLET = TOTAL_SUPPLY * 3 / 1000; // 0.3% minimum

    // State variables
    uint256 public maxBuyAmount;
    uint256 public maxSellAmount;
    uint256 public maxWalletAmount;
    uint256 public swapTokensAtAmount;

    IDexRouter public immutable uniswapV2Router;
    address public immutable uniswapV2Pair;

    bool private _swapping;
    bool public limitsInEffect = true;
    bool public tradingActive = false;
    bool public swapEnabled = false;

    uint256 public buyFee;
    uint256 public sellFee;
    uint256 public tokensForTreasury;

    uint256 public tradingActiveBlock = 0;
    uint256 public deadBlocks = 1;

    address public treasuryAddress;

    // Mappings
    mapping(address => bool) private _isExcludedFromFees;
    mapping(address => bool) public isExcludedMaxTransactionAmount;
    mapping(address => bool) public automatedMarketMakerPairs;

    // Events
    event SetAutomatedMarketMakerPair(address indexed pair, bool indexed value);
    event EnabledTrading(bool tradingActive, uint256 deadBlocks);
    event RemovedLimits();
    event ExcludeFromFees(address indexed account, bool isExcluded);
    event UpdatedMaxBuyAmount(uint256 newAmount);
    event UpdatedMaxSellAmount(uint256 newAmount);
    event UpdatedMaxWalletAmount(uint256 newAmount);
    event UpdatedTreasuryAddress(address indexed newWallet);
    event MaxTransactionExclusion(address indexed account, bool excluded);
    event SwapAndLiquify(uint256 tokensSwapped, uint256 ethReceived, uint256 tokensIntoLiquidity);
    event TransferForeignToken(address indexed token, uint256 amount);

    // Modifiers
    modifier onlyTreasury() {
        require(msg.sender == treasuryAddress, "Caller is not the treasury");
        _;
    }

    modifier tradingNotActive() {
        require(!tradingActive, "Trading is already active");
        _;
    }

    constructor(
        address _treasuryAddress,
        address _devWallet
    ) ERC20("EVANA", "EVANA") Ownable(msg.sender) {
        require(_treasuryAddress != address(0), "Treasury address cannot be zero");
        require(_devWallet != address(0), "Dev wallet cannot be zero");

        // Initialize router and pair
        IDexRouter _uniswapV2Router = IDexRouter(0x10ED43C718714eb63d5aA57B78B54704E256024E);
        uniswapV2Router = _uniswapV2Router;
        uniswapV2Pair = IDexFactory(_uniswapV2Router.factory()).createPair(
            address(this),
            _uniswapV2Router.WETH()
        );

        // Set initial values
        maxBuyAmount = TOTAL_SUPPLY * 10 / 1000; // 1% of total supply
        maxSellAmount = TOTAL_SUPPLY * 10 / 1000; // 1% of total supply
        maxWalletAmount = TOTAL_SUPPLY * 20 / 1000; // 2% of total supply
        swapTokensAtAmount = TOTAL_SUPPLY * 50 / 100000; // 0.05% of total supply

        buyFee = 4;
        sellFee = 5;
        treasuryAddress = _treasuryAddress;

        // Set up exclusions
        _setAutomatedMarketMakerPair(address(uniswapV2Pair), true);
        _excludeFromMaxTransaction(address(_uniswapV2Router), true);
        _excludeFromMaxTransaction(owner(), true);
        _excludeFromMaxTransaction(address(this), true);
        _excludeFromMaxTransaction(address(0xdead), true);
        _excludeFromMaxTransaction(_devWallet, true);

        _excludeFromFees(owner(), true);
        _excludeFromFees(address(this), true);
        _excludeFromFees(address(0xdead), true);
        _excludeFromFees(treasuryAddress, true);
        _excludeFromFees(_devWallet, true);

        // Mint initial supply
        _mint(owner(), TOTAL_SUPPLY);
    }

    receive() external payable {}

    // External functions
    function updateMaxBuyAmount(uint256 newAmount) external onlyOwner {
        require(newAmount >= MIN_MAX_BUY / 1e18, "Cannot set max buy amount lower than 0.1%");
        maxBuyAmount = newAmount * 1e18;
        emit UpdatedMaxBuyAmount(maxBuyAmount);
    }

    function updateMaxSellAmount(uint256 newAmount) external onlyOwner {
        require(newAmount >= MIN_MAX_SELL / 1e18, "Cannot set max sell amount lower than 0.1%");
        maxSellAmount = newAmount * 1e18;
        emit UpdatedMaxSellAmount(maxSellAmount);
    }

    function updateMaxWalletAmount(uint256 newAmount) external onlyOwner {
        require(newAmount >= MIN_MAX_WALLET / 1e18, "Cannot set max wallet amount lower than 0.3%");
        maxWalletAmount = newAmount * 1e18;
        emit UpdatedMaxWalletAmount(maxWalletAmount);
    }

    function removeLimits() external onlyOwner {
        limitsInEffect = false;
        emit RemovedLimits();
    }

    function excludeFromMaxTransaction(address account, bool isExcluded) external onlyOwner {
        if (!isExcluded) {
            require(account != uniswapV2Pair, "Cannot remove uniswap pair from max txn");
        }
        _excludeFromMaxTransaction(account, isExcluded);
    }

    function updateSwapThreshold(uint256 newAmount) external onlyTreasury {
        swapTokensAtAmount = newAmount * 1e18;
    }

    function updateBuyFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fees must be 30% or less");
        buyFee = newFee;
    }

    function updateSellFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fees must be 30% or less");
        sellFee = newFee;
    }

    function excludeFromFees(address account, bool excluded) external onlyOwner {
        _isExcludedFromFees[account] = excluded;
        emit ExcludeFromFees(account, excluded);
    }

    function setAutomatedMarketMakerPair(address pair, bool value) external onlyOwner {
        require(pair != uniswapV2Pair, "The pair cannot be removed from automatedMarketMakerPairs");
        _setAutomatedMarketMakerPair(pair, value);
    }

    function addLiquidity(uint256 tokenAmount, uint256 ethAmount) external onlyOwner {
        _approve(address(this), address(uniswapV2Router), tokenAmount);
        uniswapV2Router.addLiquidityETH{value: ethAmount}(
            address(this),
            tokenAmount,
            0, // slippage is unavoidable
            0, // slippage is unavoidable
            owner(),
            block.timestamp
        );
    }

    function setTreasuryAddress(address newTreasuryAddress) external onlyOwner {
        require(newTreasuryAddress != address(0), "Treasury address cannot be zero");
        treasuryAddress = newTreasuryAddress;
        emit UpdatedTreasuryAddress(newTreasuryAddress);
    }

    function transferForeignToken(address token, address to) external onlyTreasury returns (bool) {
        require(token != address(0), "Token address cannot be zero");
        require(to != address(0), "Recipient address cannot be zero");
        
        uint256 contractBalance = IERC20(token).balanceOf(address(this));
        bool success = IERC20(token).transfer(to, contractBalance);
        emit TransferForeignToken(token, contractBalance);
        return success;
    }

    function withdrawStuckETH() external onlyTreasury nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = payable(treasuryAddress).call{value: balance}("");
        require(success, "ETH transfer failed");
    }

    function manualSwap() external onlyTreasury {
        uint256 tokenBalance = balanceOf(address(this));
        require(tokenBalance > 0, "No tokens to swap");
        
        _swapping = true;
        _swapBack();
        _swapping = false;
    }

    function enableTrading(bool status, uint256 deadBlocks_) external onlyOwner tradingNotActive {
        tradingActive = status;
        swapEnabled = true;
        deadBlocks = deadBlocks_;
        
        if (tradingActive && tradingActiveBlock == 0) {
            tradingActiveBlock = block.number;
        }
        
        emit EnabledTrading(tradingActive, deadBlocks_);
    }

    // Override the transfer function to add custom logic
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        _transferWithFees(_msgSender(), to, amount);
        return true;
    }

    // Override the transferFrom function to add custom logic
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transferWithFees(from, to, amount);
        return true;
    }

    // Internal functions
    function _transferWithFees(
        address from,
        address to,
        uint256 amount
    ) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Amount must be greater than 0");

        if (limitsInEffect) {
            _enforceLimits(from, to, amount);
        }

        uint256 contractTokenBalance = balanceOf(address(this));
        bool canSwap = contractTokenBalance >= swapTokensAtAmount;

        if (canSwap && swapEnabled && !_swapping && !automatedMarketMakerPairs[from] && 
            !_isExcludedFromFees[from] && !_isExcludedFromFees[to]) {
            _swapping = true;
            _swapBack();
            _swapping = false;
        }

        bool takeFee = !_isExcludedFromFees[from] && !_isExcludedFromFees[to];
        uint256 fees = 0;

        if (takeFee && tradingActiveBlock > 0 && block.number > tradingActiveBlock) {
            if (automatedMarketMakerPairs[to] && sellFee > 0) {
                fees = (amount * sellFee) / 100;
                tokensForTreasury += fees;
            } else if (automatedMarketMakerPairs[from] && buyFee > 0) {
                fees = (amount * buyFee) / 100;
                tokensForTreasury += fees;
            }

            if (fees > 0) {
                _transfer(from, address(this), fees);
                amount -= fees;
            }
        }

        _transfer(from, to, amount);
    }

    function _enforceLimits(address from, address to, uint256 amount) internal view {
        if (from != owner() && to != owner() && to != address(0) && to != address(0xdead)) {
            if (!tradingActive) {
                require(
                    isExcludedMaxTransactionAmount[from] || isExcludedMaxTransactionAmount[to],
                    "Trading is not active"
                );
                require(from == owner(), "Trading is not enabled");
            }

            // Buy limits
            if (automatedMarketMakerPairs[from] && !isExcludedMaxTransactionAmount[to]) {
                require(amount <= maxBuyAmount, "Buy transfer amount exceeds the max buy");
                require(amount + balanceOf(to) <= maxWalletAmount, "Cannot exceed max wallet");
            }
            // Sell limits
            else if (automatedMarketMakerPairs[to] && !isExcludedMaxTransactionAmount[from]) {
                require(amount <= maxSellAmount, "Sell transfer amount exceeds the max sell");
            }
            // Wallet limits
            else if (!isExcludedMaxTransactionAmount[to] && !isExcludedMaxTransactionAmount[from]) {
                require(amount + balanceOf(to) <= maxWalletAmount, "Cannot exceed max wallet");
            }
        }
    }

    function _swapBack() private {
        uint256 contractBalance = balanceOf(address(this));
        uint256 totalTokensToSwap = tokensForTreasury;

        if (contractBalance == 0 || totalTokensToSwap == 0) return;

        if (contractBalance > swapTokensAtAmount * 5) {
            contractBalance = swapTokensAtAmount * 5;
        }

        _swapTokensForEth(contractBalance);
        tokensForTreasury = 0;

        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            (bool success, ) = payable(treasuryAddress).call{value: ethBalance}("");
            require(success, "ETH transfer to treasury failed");
        }
    }

    function _swapTokensForEth(uint256 tokenAmount) private {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = uniswapV2Router.WETH();

        _approve(address(this), address(uniswapV2Router), tokenAmount);

        uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmount,
            0, // accept any amount of ETH
            path,
            address(this),
            block.timestamp
        );
    }

    function _setAutomatedMarketMakerPair(address pair, bool value) private {
        automatedMarketMakerPairs[pair] = value;
        _excludeFromMaxTransaction(pair, value);
        emit SetAutomatedMarketMakerPair(pair, value);
    }

    function _excludeFromMaxTransaction(address account, bool isExcluded) private {
        isExcludedMaxTransactionAmount[account] = isExcluded;
        emit MaxTransactionExclusion(account, isExcluded);
    }

    function _excludeFromFees(address account, bool excluded) private {
        _isExcludedFromFees[account] = excluded;
        emit ExcludeFromFees(account, excluded);
    }
}
