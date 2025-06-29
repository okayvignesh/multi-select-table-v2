import Summary from './Summary'
import Detailed from './Detailed'

function MainBody({ activeTab }) {
    return (
        <>
            <div className="main-body">
                {activeTab === 'summary' ? <Summary /> : <Detailed />}
            </div>
        </>
    )
}

export default MainBody
