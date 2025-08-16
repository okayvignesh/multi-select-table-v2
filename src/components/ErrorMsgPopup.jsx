import React from 'react';
import './errorMsgPopup.scss';

const ErrorMsgPopup = (props) => {
	return (
		<div className={props.blinking ? 'errorMsg-popup blinking' : 'errorMsg-popup'} style={props.position}>
			<div className="icon-alert-octagon errorIcon"></div>
			<div className="errorMsg-popup-text">{props.errorMsg}</div>
		</div>
	)
}

export default ErrorMsgPopup;