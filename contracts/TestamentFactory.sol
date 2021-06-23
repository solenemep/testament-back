//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Testament.sol";

contract TestamentFactory is AccessControl {
    using Counters for Counters.Counter;

    Counters.Counter private _nbTestament;
    mapping(address => address) private _testamentOwner;
    mapping(address => address) private _testamentDoctor;
    mapping(address => bool) private _testamentEnd;
    bytes32 public constant ADMIN = keccak256("ADMIN");
    bytes32 public constant DOCTOR = keccak256("DOCTOR");

    event TestamentCreated(address indexed testament, address owner, address doctor);
    event TestamentEnded(address indexed testament);

    constructor(address admin_) {
        _setRoleAdmin(ADMIN, ADMIN);
        _setupRole(ADMIN, admin_);
    }

    function createTestament(address owner_, address doctor_) public onlyRole(ADMIN) returns (bool) {
        Testament testament = new Testament(owner_, doctor_);
        _testamentOwner[address(testament)] = owner_;
        _testamentDoctor[address(testament)] = doctor_;
        _testamentEnd[address(testament)] = false;
        _nbTestament.increment();
        emit TestamentCreated(address(testament), owner_, doctor_);
        return true;
    }

    /*
    function endTestament(Testament testament) public onlyRole(ADMIN) returns (bool) {
        _testamentEnd[address(testament)] = true;
        emit TestamentEnded(address(testament));
        return true;
    }

    function changeDoctor(Testament testament, address doctor_) public onlyRole(ADMIN) returns (bool) {
        _testamentDoctor[address(testament)] = doctor_;
    
        return true;
    }
*/
    function nbTestament() public view returns (uint256) {
        return _nbTestament.current();
    }

    function ownerOf(address testament) public view returns (address) {
        return _testamentOwner[testament];
    }

    function doctorOf(address testament) public view returns (address) {
        return _testamentDoctor[testament];
    }
}
