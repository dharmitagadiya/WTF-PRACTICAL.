function checkEligibility() {
    let age = Number(document.getElementById("age").value);
    let income = Number(document.getElementById("income").value);
    let reqEmi = Number(document.getElementById("reqEmi").value);
    let creditScore = Number(document.getElementById("creditScore").value);
    
    const MIN_CREDIT_SCORE = 650;
    const MAX_EMI_PERCENT = 0.5;
    let message = "";
    
    if (age >= 21 && age <= 60) {
        if (creditScore >= MIN_CREDIT_SCORE) {
            if (reqEmi <= income * MAX_EMI_PERCENT) {
                message = "Congratulations! You are eligible for the loan.";
            } else {
                message = "Not Eligible: Requested EMI is too high compared to your income.";
            }
        } else {
            message = "Not Eligible: Credit score is below the required minimum (650).";
        }
    } else {
        message = "Not Eligible: Age must be between 21 and 60 years.";
    }
    document.getElementById("eligibilityResult").innerText = message;
}

function calculateEmi() {
    let principal = Number(document.getElementById("loanAmount").value);
    let annualRate = Number(document.getElementById("rateOfInterest").value);
    let years = Number(document.getElementById("tenureYears").value);
    let emi = getEmi(principal, annualRate, years);
    document.getElementById("emiResult").innerText =
        "Monthly EMI = Rs " + emi.toFixed(2);
}

function getEmi(principal, annualRate, years) {
    var monthlyRate = annualRate / 12 / 100;
    var months = years * 12;
    if (monthlyRate === 0) {
        return principal / months;
    }
    
    var emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
               (Math.pow(1 + monthlyRate, months) - 1);
    return emi;
}

function calculateInterest() {
    let principal = Number(document.getElementById("principal").value);
    let rate = Number(document.getElementById("rate").value);
    let time = Number(document.getElementById("time").value);
    let type = document.getElementById("interestType").value;
    let interest = 0;
    let total = 0;
    
    switch (type) {
        case "simple":
            interest = (principal * rate * time) / 100;
            total = principal + interest;
            break;
        case "compound":
            total = principal * Math.pow((1 + rate / 100), time);
            interest = total - principal;
            break;
        default:
            interest = 0;
            total = principal;
    }
    document.getElementById("interestResult").innerText =
        "Interest = Rs " + interest.toFixed(2) + " | Total Amount = Rs " + total.toFixed(2);
}

function generateInterestTable() {
    let principal = Number(document.getElementById("tablePrincipal").value);
    let rate = Number(document.getElementById("tableRate").value);
    let years = Number(document.getElementById("tableYears").value);
    let tableHtml = "<tr><th>Year</th><th>Interest Earned</th><th>Balance</th></tr>";
    let balance = principal;
    
    for (let year = 1; year <= years; year++) {
        let yearlyInterest = balance * (rate / 100);
        balance = balance + yearlyInterest;
        tableHtml += "<tr><td>" + year + "</td><td>Rs " +
                     yearlyInterest.toFixed(2) + "</td><td>Rs " +
                     balance.toFixed(2) + "</td></tr>";
    }
    document.getElementById("interestTable").innerHTML = tableHtml;
}

function calculateAverageDeposit() {
    let total = 0;
    let count = 0;
    let deposit;
    
    do {
        deposit = Number(prompt("Enter deposit amount (enter a negative number to stop):"));
        if (deposit >= 0) {
            total = total + deposit;
            count = count + 1;
        }
    } while (deposit >= 0);
    
    let average = 0;
    if (count > 0) {
        average = total / count;
    }
    document.getElementById("averageResult").innerText =
        "Total Deposits: " + count +
        " | Total Amount: Rs " + total.toFixed(2) +
        " | Average Deposit: Rs " + average.toFixed(2);
}

var globalVar = "I am a var - function/global scoped";
let globalLet = "I am a let - block scoped";
const globalConst = "I am a const - block scoped and cannot be reassigned";

function scopeDemo() {
    let output = "";
    output += globalVar + "\n";
    output += globalLet + "\n";
    output += globalConst + "\n";
    if (true) {
        let blockLet = "let inside block - only visible here";
        var blockVar = "var inside block - visible outside too (function scoped)";
        output += blockLet + "\n";
    }
    output += blockVar;
    document.getElementById("scopeResult").innerText = output;
}
