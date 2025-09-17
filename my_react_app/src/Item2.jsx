import React from "react";
function Item2()
{  const [itemDetails,setItemDetails]=React.useState({
    item_code:"",
    item_name:"",
    cost:0,

})
    const [uom,setuom]=React.useState({
        uom_code:"",
        uom_descriptor:"",
        division_factor:0,
        uom_type:"",
    })
    const [pg,handlepg]=React.useState(1);
    function handleSubmit(event)
    {
        event.preventDefault();
        console.log(itemDetails);
    }   
    function handler(event)
    {
        event.preventDefault();
        const val=event.target.value;
        handlepg(Number(val));
    }
    return(
        <div>
                
                <form onSubmit={handleSubmit}>
                    <span>Item code</span>
                    <input
                        type="text"
                        placeholder="Item Code"
                        value={itemDetails.item_code}
                        onChange={(e) => setItemDetails({ ...itemDetails, item_code: e.target.value })}
                    />
                    <span>Item Name</span>
                    <input
                        type="text"
                        placeholder="Item Name"
                        value={itemDetails.item_name}
                        onChange={(e) => setItemDetails({ ...itemDetails, item_name: e.target.value })}
                    />
                    
                    <button value="1" onClick={handler}>stock detail</button>
                    <button value="2" onClick={handler}>unit of measurement</button>
                    {pg==1&&
                    <div>
                    <span>Cost</span>
                    <input type="number"
                        placeholder="Cost"
                        value={itemDetails.cost}
                        onChange={(e)=>{setItemDetails({...itemDetails,cost: Number(e.target.value)})}}
                    /> 
                    </div>
    }     
                      {pg==2&&
                    <div>
                        <table>
                            <tbody>
                                <tr>
                                    <td>UOM CODE</td>
                                    <td><input type="text" onChange={(e) => setuom({ ...uom, uom_code: e.target.value })} placeholder="UOM CODE" /></td>
                                </tr>
                                <tr>
                                    <td>UOM DESCRIPTOR</td>
                                    <td><input type="text" onChange={(e) => setuom({ ...uom, uom_descriptor: e.target.value })} placeholder="UOM DESCRIPTOR" /></td>
                                </tr>
                                <tr>
                                    <td>division factor</td>
                                    <td><input type="number" onChange={(e) => setuom({ ...uom, division_factor: Number(e.target.value) })} placeholder="division factor" /></td>
                                </tr>
                                <tr>
                                    <td>UOM type</td>
                                     <td>
                                     <select
                                         value={uom.uom_type}
                                         onChange={(e) => setuom({ ...uom, uom_type: e.target.value })}
                                     >
                                         <option value="">-- Select --</option>
                                         <option value="base">Base</option>
                                         <option value="non-base">Non-Base</option>
                                     </select>
                            </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    }
                   
                    <button type="submit">Submit</button>

                </form>

            
        </div>
    )   
}

export default Item2;