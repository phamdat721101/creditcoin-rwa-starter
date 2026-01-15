// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleLoan {
    // 3.1 Data Structures
    enum LoanStatus {
        PENDING,
        ACTIVE,
        REPAID,
        DEFAULTED
    }

    struct Loan {
        uint256 id;
        address borrower;
        address lender;
        uint256 amount;
        uint256 dueDate;
        LoanStatus status;
    }

    // State Variables
    uint256 public loanCount;
    mapping(uint256 => Loan) public loans;

    // 3.3 Events
    event LoanRequested(uint256 indexed id, address indexed borrower, uint256 amount);
    event LoanFunded(uint256 indexed id, address indexed lender);
    event LoanRepaid(uint256 indexed id, address indexed borrower, uint256 timestamp);

    // 3.2 Required Functions

    /**
     * @dev Creates a PENDING loan request.
     * @param _amount The amount of CTC requested.
     */
    function createLoanRequest(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");

        loanCount++;
        loans[loanCount] = Loan({
            id: loanCount,
            borrower: msg.sender,
            lender: address(0),
            amount: _amount,
            dueDate: 0, // Set when funded
            status: LoanStatus.PENDING
        });

        emit LoanRequested(loanCount, msg.sender, _amount);
    }

    /**
     * @dev Funds a loan, transferring CTC to borrower.
     * @param _loanId The ID of the loan to fund.
     */
    function fundLoan(uint256 _loanId) external payable {
        Loan storage loan = loans[_loanId];
        
        require(loan.status == LoanStatus.PENDING, "Loan is not pending");
        require(msg.sender != loan.borrower, "Borrower cannot fund own loan");
        require(msg.value == loan.amount, "Incorrect funding amount");

        loan.lender = msg.sender;
        loan.status = LoanStatus.ACTIVE;
        loan.dueDate = block.timestamp + 30 days; // Fixed 30 day term for simplicity

        // Transfer funds to borrower
        (bool sent, ) = loan.borrower.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        emit LoanFunded(_loanId, msg.sender);
    }

    /**
     * @dev Repays a loan, transferring Principal + Interest to lender.
     * @param _loanId The ID of the loan to repay.
     */
    function repayLoan(uint256 _loanId) external payable {
        Loan storage loan = loans[_loanId];
        
        require(loan.status == LoanStatus.ACTIVE, "Loan is not active");
        // Allow anyone to repay? Usually only borrower, but for UX anyone can help repay.
        // Let's restrict to borrower for strictness, or allow open for flexibility.
        // Prompt implies borrower clicks repay.
        
        uint256 interest = (loan.amount * 5) / 100; // 5% flat interest
        uint256 totalRepayment = loan.amount + interest;

        require(msg.value >= totalRepayment, "Insufficient repayment amount");

        loan.status = LoanStatus.REPAID;

        // Transfer funds to lender
        (bool sent, ) = loan.lender.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        emit LoanRepaid(_loanId, loan.borrower, block.timestamp);
    }

    /**
     * @dev Returns full loan details.
     * @param _id Loan ID.
     */
    function getLoanById(uint256 _id) external view returns (Loan memory) {
        return loans[_id];
    }
}
