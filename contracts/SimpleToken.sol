pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";


contract SimpleToken is ERC20Mintable, ERC20Detailed {
    constructor() public ERC20Mintable() ERC20Detailed("SimpleToken", "SIM", 18) {

    }
}
