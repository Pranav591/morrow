import { Component } from "react";
import { formatMoney } from "../../../shared/format.js";

class MonthlyInsight extends Component {
  render() {
    const { spent, budget, transactionCount } = this.props;
    const remaining = budget - spent;
    const status = remaining >= 0 ? "within your plan" : "over your plan";

    return (
      <div className="monthly-insight">
        <span className="panel-kicker">MONTHLY CHECK-IN</span>
        <strong>{formatMoney(Math.abs(remaining))}</strong>
        <span>
          {remaining >= 0 ? "left" : "over"} · {transactionCount} expenses ·{" "}
          {status}
        </span>
      </div>
    );
  }
}

export default MonthlyInsight;
