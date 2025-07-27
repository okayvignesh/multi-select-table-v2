import React from 'react'

function ErrorModal({ modalRef, apiStatus }) {
    return (
        <>
            <button type="button" class="btn position-absolute" data-bs-toggle="modal" data-bs-target="#apiErrorModal" style={{ opacity: 0 }} ref={modalRef}>
            </button>

            <div
                className="modal fade"
                tabIndex="-1"
                id="apiErrorModal"
                aria-labelledby="apiErrorModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="apiErrorModalLabel">Error(s)</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <ul>
                                {Object.entries(apiStatus).map(([api, msg]) => (
                                    <li key={api} className='text-capitalize'>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ErrorModal