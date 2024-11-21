export const generateEmailBody = (
  billingStart: string,
  billingDate: string,
  total: number,
  avgPerDay: number,
  daysOfOccupancy: number,
  amountDue: string
): string => {
  return `

  <div dir="ltr">
  <div>Below is information about water and sewer usage for the latest billing period.<br></div>
  <br>
  <table style="border: 0.5px solid black;">
    <tbody>
      <tr style="background-color:rgb(217,217,217)">
        <td>Billing Start</td>
        <td>Billing Date</td>
        <td>Total ($)</td>
      </tr>
      <tr>
        <td>${billingStart}</td>
        <td>${billingDate}</td>
        <td style="background-color:rgb(255,229,153)">$${total}</td>
      </tr>
    </tbody>
  </table>
  <br>
  <table style="border: 0.5px solid black;">
    <tbody>
      <tr style="background-color:rgb(217,217,217)">
        <td>Avg per day/unit ($)</td>
        <td>Days of Occupancy</td>
        <td>Amount Due ($)</td>
      </tr>
      <tr>
        <td style="background-color:rgb(217,217,217)">$${avgPerDay.toFixed(2)}</td>
        <td>${daysOfOccupancy.toFixed(0)}</td>
        <td style="background-color:rgb(244,204,204)">$${amountDue}</td>
      </tr>
    </tbody>
  </table>
  <br>
  <div>You have the option of paying as soon as you get the bill or to add the amount to the next rent payment.<br></div>
  <div>Thank you</div>
</div>


`;
};
