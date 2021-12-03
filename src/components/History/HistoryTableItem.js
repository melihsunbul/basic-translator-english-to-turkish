import "./HistoryTableItem.bundle.scss";

function HistoryTableItem(props) {
    return (
        <tr>
            <td>{ props.time }</td>
            <td>{ props.source }</td>
            <td>{ props.translation }</td>
        </tr>
    );
}

export default HistoryTableItem;