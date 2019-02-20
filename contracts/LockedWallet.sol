pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract LockedWallet is Ownable {
    using SafeMath for uint256;

    event Withdrawn (
        uint256 period,
        uint256 amount,
        uint256 timestamp
    );

    uint256 public depositedTime;
    uint256 public periodLength;
    uint256 public amountPerPeriod;
    IERC20 public token;
    uint256 public depositedAmount;
    mapping(uint256 => uint256) public withdrawalByPeriod;

    constructor(uint256 newPeriodLength, uint256 newAmountPerPeriod, address tokenAddress) public {
        require(tokenAddress != address(0));
        require(newPeriodLength > 0);
        require(newAmountPerPeriod > 0);

        token = IERC20(tokenAddress);
        periodLength = newPeriodLength;
        amountPerPeriod = newAmountPerPeriod;
    }

    function deposit(uint256 amount) public {
        require(depositedTime == 0, "already deposited");

        depositedTime = now;
        depositedAmount = amount;

        token.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw() public onlyOwner {
        require(depositedTime > 0, "not deposited");

        uint256 currentPeriod = now.sub(depositedTime).div(periodLength);
        require(currentPeriod > 0, "invalid period 1");
        require(withdrawalByPeriod[currentPeriod] == 0, "already withdrawn");

        uint256 balance = token.balanceOf(address(this));
        uint256 amount = amountPerPeriod < balance ? amountPerPeriod : balance;
        require(amount > 0, "empty");

        withdrawalByPeriod[currentPeriod] = amount;

        emit Withdrawn(currentPeriod, amount, now);

        token.transfer(owner(), amount);
    }

    function balance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
