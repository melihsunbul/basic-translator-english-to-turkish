import "./HistoryTable.bundle.scss";
import HistoryTableHeader from "./HistoryTableHeader";
import HistoryTableItem from "./HistoryTableItem";

function HistoryTable(props) {
    if (props.items.length < 1) {
        return (
            <h3>
                No history found.
            </h3>
        );
    }
    return (
        <table>
            <tbody>
                <HistoryTableHeader />
                {props.items.map((item) => (
                    <HistoryTableItem
                        key={item.time}
                        time={item.time}
                        source={item.source}
                        translation={item.translation}
                    />
                ))}
            </tbody>
        </table>
    );
}

export default HistoryTable;