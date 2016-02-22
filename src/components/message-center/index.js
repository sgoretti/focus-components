import React, {Component, PropTypes} from 'react';
import capitalize from 'lodash/string/capitalize';
import messageStore from 'focus-core/message/built-in-store';

const defaultProps = {
    ttlError: 10000,
    ttlInfo: 10000,
    ttlSuccess: 5000,
    ttlWarning: 5000
};

const propTypes = {
    ttlError: PropTypes.number.isRequired,
    ttlInfo: PropTypes.number.isRequired,
    ttlSuccess: PropTypes.number.isRequired,
    ttlWarning: PropTypes.number.isRequired
};

class MessageCenter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            message: undefined,
            messageQueue: []
        }
    };

    /** @inheriteddoc */
    componentWillMount() {
        messageStore.addPushedMessageListener(this._handlePushMessage);
    };
    /** @inheriteddoc */
    componentWillUnmount() {
        messageStore.removePushedMessageListener(this._handlePushMessage);
    };


    _handlePushMessage = messageId => {
        const {snackbarContainer} = this.refs;
        const message = messageStore.getMessage(messageId);
        const {content, action, type} = message;
        const ttl = this.props[`ttl${capitalize(type)}`];
        const messageData = {
            message: content,
            timeout: ttl
        };
        if(action) {
            messageData.actionText = action.text;
            messageData.actionHandler = action.handler;
        }
        this._showSnackbar(messageData);
    };

    _checkQueue = () => {
        const {messageQueue} = this.state;
        if (messageQueue.length > 0) {
            this._showSnackbar(messageQueue.shift());
        }
    };

    _clean = () => {
        this.setState({
            active: false,
            message: undefined
        });
        this._checkQueue();
    };

    _cleanup = () => {
        setTimeout(this.clean, 1000);
    };

    _displaySnackbar = () => {
        const {timeout} = this.state;
        setTimeout(this._cleanup, timeout);
    };

    _showSnackbar = (data) => {
        if (data === undefined) {
            throw new Error ('Please provide a data object with at least a message to display.');
        }
        if (data['message'] === undefined) {
            throw new Error('Please provide a message to be displayed.');
        }
        if (data['actionHandler'] && !data['actionText']) {
            throw new Error('Please provide action text with the handler.');
        }
        const {active, messageQueue} = this.state;
        if (active) {
            messageQueue.push(data);
        } else {
            this.setState({
                active: true,
                message: data
            });
            this._displaySnackbar();
        }
    };

    /** @inheritDoc */
    render() {
        const {active, message, messageQueue} = this.state;
        const mdlClasses = `focus-snackbar ${active ? '' : 'focus-snackbar--active'}`;
        console.log(active, message, messageQueue);
        return (
            <div data-focus='message-center2' className={mdlClasses} aria-live='assertive' aria-atomic='true' aria-relevant='text' ref='snackbarContainer'>
                {message &&
                    <div className='mdl-snackbar__text'>{message.message}</div>
                }
                <button className='mdl-snackbar__action' type='button'></button>
            </div>
        );
    };

};

//Static props.
MessageCenter.displayName = 'MessageCenter';
MessageCenter.defaultProps = defaultProps;
MessageCenter.propTypes = propTypes;

export default MessageCenter;
