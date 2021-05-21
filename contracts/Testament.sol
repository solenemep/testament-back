// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// Pour remix il faut importer une url depuis un repository github
// Depuis un project Hardhat ou Truffle on utiliserait: import "@openzeppelin/ccontracts/utils/Address.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Address.sol";

contract Testament {
    // library usage
    using Address for address payable;

    // State variables
    address private _owner;
    address private _doctor;
    bool private _endContract; 
    mapping (address => uint256) private _legacy;

    // Events
    event DoctorSet(address indexed sender, address doctor);
    event ContractEnded(address indexed sender);
    event Bequeathed(address indexed sender, address recipient, uint256 legacy);
    event Withdrawed(address indexed sender, uint256 legacy);

    // constructor
    constructor(address owner_, address doctor_) {
        _owner = owner_;
        _doctor = doctor_;
    }

    // modifiers
   modifier onlyOwner() {
       require(msg.sender == _owner, "Testament : only Owner can use this function.");
       _;
   }
      modifier onlyDoctor() {
       require(msg.sender == _doctor, "Testament : only Doctor can use this function.");
       _;
   }
   modifier contractEnded() {
       require(_endContract == true, "Testament : Owner is still alive");
       _;
   }

    // Function declarations below
    function setDoctor(address doctor_) public onlyOwner {
        require(msg.sender != doctor_, "You cannot be your Doctor.");
        _doctor = doctor_; 
        emit DoctorSet(msg.sender, doctor_); 
    }
    function endContract() public onlyDoctor {
        require(_endContract == false, "Testament : Contract is already ended."); 
        emit ContractEnded(msg.sender); 
    }
    function bequeath(address recipient, uint256 legacy_) onlyOwner public payable {
        _legacy[recipient] += legacy_;
        emit Bequeathed(msg.sender, recipient, legacy_); 
    }
    function withdrawLegacy() contractEnded public payable {
        uint256 legacy_ = _legacy[msg.sender];
        _legacy[msg.sender] = 0;
        payable(msg.sender).sendValue(legacy_);
        emit Withdrawed(msg.sender, legacy_); 
    }

    // Add getters