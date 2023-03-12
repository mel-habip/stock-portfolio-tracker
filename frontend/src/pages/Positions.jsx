import React, { useState, useContext, useEffect } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import axios from 'axios';

import NavMenu from '../components/NavMenu';
import { Button, Modal, Spacer, Table, Text, Input, Checkbox } from '@nextui-org/react';

import { CustomButton } from '../fields/CustomButton';

import { DatePicker } from 'react-responsive-datepicker'
import 'react-responsive-datepicker/dist/index.css'

import CustomDatePicker from '../fields/CustomDatePicker.jsx';

function Positions() {

    const [positions, setPositions] = useState([]);
    const [includeDeletedPositions, setIncludeDeletedPositions] = useState(false);
    const [additionModalOpen, setAdditionModalOpen] = useState(false);
    const [ticker, setTicker] = useState('');
    const [size, setSize] = useState('');
    const [soldOn, setSoldOn] = useState('');
    const [acquiredOn, setAcquiredOn] = useState('');
    const [tickerError, setTickerError] = useState('');
    const [sizeError, setSizeError] = useState('');
    const [acquiredOnPickerIsOpen, setAcquiredOnPickerIsOpen] = useState(false);
    const [soldOnPickerIsOpen, setSoldOnPickerIsOpen] = useState(false);


    const { setIsLoggedIn, userId, accessToken, firstName } = useContext(IsLoggedInContext);

    const user = {
        id: userId,
        access_token: accessToken,
    };

    const frmt = (date) => {
        console.log(date);
        if (!date) {
            setAcquiredOnPickerIsOpen(false); //provides the clearing function
            return '';
        }
        let yyyy = date.getFullYear();
        let mm = date.getMonth() + 1;
        if (mm < 10) mm = `0` + mm;
        let dd = date.getDate();
        return `${yyyy}-${mm}-${dd}`
    }

    useEffect(() => {
        console.log('user', user);
        axios.get(`http://localhost:8000/positions/user/${user.id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }).then(response => {
            console.log('response:', response.data);
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_id');
                setIsLoggedIn(false);
            } else if (response.status === 200) {
                setPositions(response.data);
            }
        });
    }, [includeDeletedPositions]);

    const columns = [
        {
            key: "position_id",
            label: "ID",
        },
        {
            key: "ticker",
            label: "Ticker",
        },
        {
            key: "size",
            label: "Size",
        },
        {
            key: "acquired_on",
            label: "Acquired On",
        },
        {
            key: "sold_on",
            label: "Sold On",
        },
        {
            key: "actions",
            label: "Actions",
        },
    ];

    return (
        <>
            <NavMenu first_name={firstName}></NavMenu>

            <Checkbox>Include deleted positions</Checkbox>

            <Table
                aria-label="Example table with dynamic content"
                striped
                bordered
                shadow={true}
                hoverable
                color="primary"
                containerCss={{
                    height: "auto",
                    minWidth: "70%",
                    'z-index': 10
                }}
            >
                <Table.Header columns={columns}>
                    {(column) => (
                        <Table.Column key={column.key} css={{ padding: '20px' }} >{column.label}</Table.Column>
                    )}
                </Table.Header>
                <Table.Body items={positions} css={{ 'text-align': 'left' }}>
                    {(item) => (
                        <Table.Row key={item.position_id} className="position-table-row">
                            {(columnKey) => <Table.Cell>{CellContentsHandler(item, columnKey)}</Table.Cell>}
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
            <Spacer y={4}></Spacer>
            <Button onClick={() => setAdditionModalOpen(true)} >Add position&nbsp;<i className="fa-regular fa-square-plus"></i></Button>
            {additionModalOpen && <>
                <Modal
                    closeButton
                    blur
                    aria-labelledby="modal-title"
                    open={additionModalOpen}
                    onClose={() => setAdditionModalOpen(false)}
                >
                    <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                        <Text size={14} >
                            Please enter the information below
                        </Text>
                    </Modal.Header>
                    <Modal.Body>
                        {/* <ErrorModule errorMessage={generalErrorMessage}></ErrorModule> */}
                        <Spacer y={0.4} />
                        <Input
                            rounded
                            value={ticker}
                            initialValue=""
                            clearable
                            type="text"
                            required
                            pattern="[A-Z.-]"
                            bordered
                            labelPlaceholder="Ticker*"
                            color={tickerError ? "error" : "primary"}
                            status={tickerError ? "error" : "default"}
                            helperText={tickerError}
                            helperColor={tickerError ? "error" : "primary"}
                            onChange={(e) => setTickerError('') || setTicker(e.target.value)} />
                        <Spacer y={0.5} />
                        <Input
                            value={size}
                            initialValue="0.0"
                            rounded
                            type="number"
                            required
                            bordered
                            labelPlaceholder="Size*"
                            color={sizeError ? "error" : "primary"}
                            status={sizeError ? "error" : "default"}
                            helperText={sizeError}
                            helperColor={sizeError ? "error" : "primary"}
                            onChange={(e) => setSizeError('') || setSize(e.target.value)} />
                        <Spacer y={0.5} />
                        <Checkbox> <Text size={16}>Active</Text> </Checkbox>
                        <Spacer y={0.5} />

                        <Input
                            value={acquiredOn}
                            rounded
                            type="text"
                            clearable
                            bordered
                            labelPlaceholder="Acquired On"
                            color={sizeError ? "error" : "primary"}
                            status={sizeError ? "error" : "default"}
                            helperText={sizeError}
                            helperColor={sizeError ? "error" : "primary"}
                            onClick={() => setAcquiredOnPickerIsOpen(true)}
                            onClearClick={() => setAcquiredOn('')}
                        />

                        <DatePicker
                            isOpen={acquiredOnPickerIsOpen}
                            onClose={() => setAcquiredOnPickerIsOpen(false)}
                            onChange={(val) => setAcquiredOn(frmt(val)) || console.log(acquiredOn) || setAcquiredOnPickerIsOpen(false)}
                            closeText={<i className="fa-regular fa-circle-check"></i>}
                            clearText={acquiredOn ? <i className="fa-regular fa-trash-can"></i> : ''}

                            defaultValue={new Date()}
                            minDate={new Date(2000, 10, 10)}
                            headerFormat='DD, MM dd'
                        />
                        <Spacer y={0.5} />
                        <Input
                            value={soldOn}
                            rounded
                            type="text"
                            clearable
                            bordered
                            labelPlaceholder="Sold On"
                            color={sizeError ? "error" : "primary"}
                            status={sizeError ? "error" : "default"}
                            helperText={sizeError}
                            helperColor={sizeError ? "error" : "primary"}
                            onClick={() => setSoldOnPickerIsOpen(true)}
                            onClearClick={() => setSoldOn('')}
                        />

                        <DatePicker
                            isOpen={soldOnPickerIsOpen}
                            onClose={() => setSoldOnPickerIsOpen(false)}
                            onChange={(val) => setSoldOn(frmt(val)) || console.log(soldOn) || setSoldOnPickerIsOpen(false)}
                            closeText={<i className="fa-regular fa-circle-check"></i>}
                            clearText={soldOn ? <i className="fa-regular fa-trash-can"></i> : ''}

                            defaultValue={new Date()}
                            minDate={new Date(2000, 10, 10)}
                            headerFormat='DD, MM dd'
                        />

                        <Button
                            disabled={!ticker || !size || size === '0'}
                            auto
                            onPress={async () => {
                                console.log('creating position', acquiredOn);
                                const options = {
                                    method: 'POST',
                                    url: `http://localhost:8000/positions/`,
                                    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                                    data: {
                                        ticker,
                                        size: parseFloat(size),
                                        user_id: user.id,
                                        acquired_on: acquiredOn || null,
                                        sold_on: soldOn || null,
                                    }
                                };
                                await axios.request(options).then(response => {
                                    console.log('response:', response.data);
                                    if (response.status === 201) {
                                        console.log('successful');
                                        setAdditionModalOpen(false);
                                        setPositions(positions.concat(response.data))
                                    } else {
                                        console.log(response);
                                    }
                                });
                            }}>
                            Create Position&nbsp;&nbsp;<i className="fa-regular fa-square-plus"></i>
                        </Button>
                    </Modal.Body>

                </Modal>
            </>}
        </>
    )
}

export default Positions;

async function table_provider() {
    let response = await axios.get('http://localhost:8000/users/login/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    });
}



function CellContentsHandler(content, key) {
    if (key === 'actions') {
        return <>
            <CustomButton><i className="fa-regular fa-pen-to-square"></i></CustomButton>
            <CustomButton><i className="fa-regular fa-trash-can"></i></CustomButton>
            <CustomButton><i className="fa-solid fa-list-ul"></i></CustomButton>
        </>
    } else if (['acquired_on', 'sold_on'].includes(key)) {
        return content[key] ? content[key].substring(0,10) : ' - '
    } else {
        return content[key]
    }
}