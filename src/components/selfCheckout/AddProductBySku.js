import React, {useState, useContext, useEffect} from "react"
import axios from "axios"
import {Button, Stack, TextField, Switch, Box, LinearProgress, Autocomplete} from "@mui/material"
import {cartContext} from "./cartContext"
import {getProductListOverview} from "../products/products";
import FormControl from "@mui/material/FormControl";

const __ = wp.i18n.__


function AddProductBySku({setShowCart, setAdding, setProductError, POSMode}) {
    const {cart, setCart} = useContext(cartContext)
    const [products, setProducts] = useState(null)
    const [productsLoading, setProductsLoading] = useState(true)
    const [amount, setAmount] = useState(1)
    const [sku, setSku] = useState("")
    const [freePosition, setFreePosition] = useState("")
    const [freePositionPrice, setFreePositionPrice] = useState(0)
    const [freeEntry, setFreeEntry] = useState(false)

    useEffect(() => {
        let reArrangeProductData = []
        getProductListOverview().then(function (response) {
            if (response.products) {
                const prod = response.products;
                Object.keys(prod).forEach(function (key, index) {
                    let productToDo = {};
                    productToDo.label = prod[key].name + " (" + prod[key].sku + "), " + prod[key].unit;
                    productToDo.id = prod[key].id;
                    productToDo.sku = prod[key].sku;
                    reArrangeProductData.push(productToDo);
                });
                setProducts(reArrangeProductData);
                setProductsLoading(false)
                console.log(reArrangeProductData)
            }
        }).catch(error => console.log(error))

    }, []);

    function addProduct() {
        const productExists = cart.some(cartItem => {
            return sku.toString() === cartItem.sku.toString()
        })
        if (productExists) {
            setProductError(__("Produkt ist schon im Warenkorb. Du kannst die Menge erhöhen", "fcplugin"))
            setShowCart(true)
            setAdding(false)
        } else {
            axios
                .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getProduct?sku=${sku}`)
                .then(function (response) {
                    if (response.data) {
                        const res = JSON.parse(response.data)
                        if (!res) {
                            setProductError("Produkt nicht gefunden oder nicht an Lager.")
                        } else {
                            let newCart = cart
                            res.id = newCart.length
                            res.order_type = "self_checkout"
                            res.amount = amount
                            newCart.push(res)
                            console.log("log", res)
                            setCart(newCart)
                            if (newCart.length > 0) {
                                localStorage.setItem("fc_selfcheckout_cart", JSON.stringify(newCart))
                            }
                        }
                    }
                })
                .catch(error => console.log(error))
                .finally(() => {
                    setAdding(false)
                    setShowCart(true)
                })
        }
    }

    function addFreeProduct() {
        let newCart = cart
        newCart.push({
            id: newCart.length,
            order_type: "self_checkout",
            amount: 1,
            name: freePosition,
            price: parseFloat(freePositionPrice),
            product_id: 0,
            sku: "fcplugin_pos_product",
            unit: ""
        })
        setCart(newCart)
        setShowCart(true)
        setAdding(false)
        setFreeEntry(false)
        setFreePosition("")
        setFreePositionPrice(0)
    }

    useEffect(() => {
        !POSMode && setFreeEntry(false)
    }, [POSMode])

    return (
        <>
            {!productsLoading ? (
                <Stack spacing={3} sx={{width: "100%", padding: "20px"}}>
                    <h2>{__("Produkt hinzufügen", "fcplugin")}</h2>

                    {POSMode && (
                        <Box sx={{marginRight: 2}}>
                            {__("Position frei erfassen?", "fcplugin")} <Switch checked={freeEntry}
                                                                                onChange={event => setFreeEntry(event.target.checked)}
                                                                                inputProps={{"aria-label": "freeEntry"}}
                                                                                color={"POSModeColor"}/>
                        </Box>
                    )}

                    {freeEntry ? (
                        <>
                            <TextField size="normal" id="Freie Eingabe" label={__("Freie Eingabe", "fcplugin")}
                                       name="Freie Eingabe" variant="outlined" value={freePosition}
                                       onChange={e => setFreePosition(e.target.value)} autoFocus
                                       color={POSMode ? "POSModeColor" : "primary"}/>
                            <TextField size="normal" id="Preis" label={__("Preis", "fcplugin")} name="Preis"
                                       variant="outlined"
                                       value={freePositionPrice} onChange={e => setFreePositionPrice(e.target.value)}
                                       autoFocus
                                       color={POSMode ? "POSModeColor" : "primary"}/>
                            <Button onClick={addFreeProduct} variant="contained" size="large"
                                    color={POSMode ? "POSModeColor" : "primary"}>
                                {__("Zum Warenkorb hinzufügen", "fcplugin")}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Stack spacing={3} sx={{width: "100%", paddingTop: "10px"}}>
                                {products && (
                                    <Autocomplete
                                        sx={{width: "100%"}}
                                        onChange={(event, newValue) => {
                                            setSku(newValue.sku)
                                        }}
                                        id="product"
                                        options={products}
                                        disablePortal
                                        renderInput={params => <TextField {...params} label={__("Produkt", "fcplugin")}
                                                                          className="autocompleteField"/>}
                                    />
                                )}

                                <FormControl>
                                    <TextField id="amount" value={amount}
                                               onChange={e => setAmount(e.target.value)} variant="outlined"
                                               type="number" label={__("Anzahl", "fcplugin")}/>
                                </FormControl>
                            </Stack>

                            <Button onClick={addProduct} variant="contained" size="large"
                                    color={POSMode ? "POSModeColor" : "primary"}>
                                {__("Zum Warenkorb hinzufügen", "fcplugin")}
                            </Button>
                        </>
                    )}
                </Stack>
            ) : (
                <Box sx={{width: "98%"}}>
                    <LinearProgress/>
                </Box>
            )}
        </>
    )
}

export default AddProductBySku
