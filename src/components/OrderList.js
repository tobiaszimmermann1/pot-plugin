import React, { useState, useEffect, useRef, useMemo } from "react"
import axios from "axios"
import MaterialReactTable from "material-react-table"
import { MRT_Localization_DE } from "material-react-table/locales/de"
import { Box, Stack, Typography, Button, CircularProgress } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import { format } from "date-fns"
import CelebrationIcon from "@mui/icons-material/Celebration"
import HourglassTopIcon from "@mui/icons-material/HourglassTop"
const __ = wp.i18n.__

const OrderList = ({ allProducts, bestellrundenProducts, bestellrundenDates, activeBestellrunde, activeState }) => {
  const [products, setProducts] = useState()
  const [productsLoading, setProductsLoading] = useState(true)
  const [currentTotal, setCurrentTotal] = useState(0)
  const [initialTotal, setInitialTotal] = useState(0)
  const [balance, setBalance] = useState(null)
  const [originalBalance, setOriginalBalance] = useState(0)
  const [cart, setCart] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartNonce, setCartNonce] = useState(null)
  const [publicPrices, setPublicPrices] = useState(null)
  const [loading, setLoading] = useState(true)
  const [nmbr, setnmbr] = useState(0)

  const tableInstanceRef = useRef(null)

  /**
   * Get cart data of user
   */
  useEffect(() => {
    if (!originalBalance) {
      axios
        .get(`${frontendLocalizer.apiUrl}/wc/store/v1/cart/items`)
        .then(function (response) {
          setCartNonce(response.headers["x-wc-store-api-nonce"])
          if (response?.data?.length > 0) {
            const res = response.data
            let cartData = []
            res.map(item => {
              cartData.push([item.id, item.quantity, item.name, item.prices.price / 100])
            })
            setCart(cartData)
          }

          if (balance === null) {
            axios
              .post(`${frontendLocalizer.apiUrl}/foodcoop/v1/getBalance`, {
                id: frontendLocalizer.currentUser.ID
              })
              .then(function (response) {
                if (response.data) {
                  const res = JSON.parse(response.data)
                  let b = res
                  if (b === null) {
                    b = 0
                  }
                  setBalance(parseFloat(b))
                  setOriginalBalance(parseFloat(b))
                }
              })
              .catch(error => console.log(error))
              .finally(() => {
                setLoading(false)
              })
          }
        })
        .catch(error => console.log(error))
    }
    if (initialTotal > 0 && originalBalance !== null) {
      setOriginalBalance(originalBalance + initialTotal)
    }
  }, [initialTotal])

  /**
   * Prepare product data for order table
   */
  useEffect(() => {
    let reArrangeProductData = []
    let initialTotal = 0
    if (allProducts && activeState !== null) {
      allProducts.map(p => {
        let productToDo = {}
        productToDo.amount = p.amount
        productToDo.name = p.name
        productToDo.unit = p._einheit
        productToDo.lot = p._gebinde
        productToDo.details = p._lieferant + ", " + p._herkunft
        productToDo.category = p.category_name
        productToDo.id = p.id
        // public prices?
        if (publicPrices === "0") {
          if (frontendLocalizer.currentUser.ID) {
            productToDo.price = p.price
          } else {
            productToDo.price = "-"
          }
        } else {
          productToDo.price = p.price
        }

        if (activeState) {
          if (bestellrundenProducts) {
            if (bestellrundenProducts.includes(p.id.toString())) {
              if (cart) {
                cart.map(item => {
                  if (item[0] === p.id) {
                    productToDo.amount = item[1]
                    initialTotal += item[1] * item[3]
                  }
                })
              } else {
                if (p.amount > 0) {
                  initialTotal += p.amount * p.price
                }
              }
              reArrangeProductData.push(productToDo)
            }
          }
        } else {
          reArrangeProductData.push(productToDo)
        }
      })
      setProducts(reArrangeProductData)
      setProductsLoading(false)
      setCurrentTotal(initialTotal)
      setInitialTotal(initialTotal)
    }
  }, [bestellrundenProducts, publicPrices, allProducts, cart, activeState])

  useEffect(() => {
    if (originalBalance) {
      setBalance(originalBalance - initialTotal)
    }
  }, [initialTotal, originalBalance])

  /**
   * Product Table
   */
  const columns = useMemo(
    () => [
      {
        accessorKey: "amount",
        header: __("Menge", "fcplugin"),
        size: 40,
        enableEditing: true,
        muiTableBodyCellEditTextFieldProps: {
          required: true,
          type: "number",
          variant: "outlined",
          inputProps: {
            min: 0
          }
        }
      },
      {
        accessorKey: "name",
        header: __("Produkt", "fcplugin"),
        enableEditing: false,
        Cell: ({ cell }) => <span style={{ fontWeight: "bold" }}>{cell.getValue()}</span>
      },
      {
        accessorKey: "category",
        id: "category_id",
        header: __("Kategorie", "fcplugin"),
        enableEditing: false,
        size: 80
      },
      {
        accessorKey: "price",
        header: __("Preis", "fcplugin"),
        size: 30,
        enableEditing: false,
        Cell: ({ cell }) => <span style={{ fontWeight: "bold" }}>{parseFloat(cell.getValue()).toFixed(2)}</span>
      },
      {
        accessorKey: "unit",
        header: __("Einheit", "fcplugin"),
        size: 30,
        enableEditing: false
      },
      {
        accessorKey: "lot",
        header: __("Gebinde", "fcplugin"),
        size: 30,
        enableEditing: false
      },
      {
        accessorKey: "details",
        header: __("Produzent & Herkunft", "fcplugin"),
        size: 80,
        enableEditing: false
      },
      {
        accessorKey: "id",
        header: __("ID", "fcplugin"),
        enableEditing: false,
        size: 50
      }
    ],
    []
  )

  const handleSaveCell = (cell, value) => {
    value ? (products[cell.row.index][cell.column.id] = value) : (products[cell.row.index][cell.column.id] = 0)
    setnmbr(nmbr + 1)
  }

  useEffect(() => {
    if (products) {
      let newCurrentTotal = 0
      products.map(row => {
        newCurrentTotal += parseFloat(row.amount) * parseFloat(row.price)
      })
      setCurrentTotal(newCurrentTotal)
      setBalance(originalBalance - newCurrentTotal)
    }
  }, [nmbr])

  /**
   * Add to Cart function
   */
  const addToCart = async () => {
    let i = 0

    while (i < products.length) {
      if (products[i].amount > 0) {
        try {
          const response = await axios.post(
            `${frontendLocalizer.apiUrl}/wc/store/v1/cart/items`,
            {
              id: products[i].id,
              quantity: parseInt(products[i].amount)
            },
            {
              headers: {
                "X-WC-Store-API-Nonce": cartNonce
              }
            }
          )
        } catch (error) {
          console.log(error)
        }
      }

      if (i === products.length - 1) {
        setAddingToCart(false)
        window.location.href = frontendLocalizer.cartUrl
      }

      i++
    }
  }

  function handleAddToCart() {
    setAddingToCart(true)
    if (cartNonce) {
      axios
        .delete(`${frontendLocalizer.apiUrl}/wc/store/v1/cart/items/`, {
          headers: {
            "X-WC-Store-API-Nonce": cartNonce
          }
        })
        .then(res => {
          addToCart()
        })
        .catch(error => console.log(error))
    }
  }

  /**
   * Determine if prices are shown publicly or not
   */
  useEffect(() => {
    axios
      .get(`${frontendLocalizer.apiUrl}/foodcoop/v1/getOption?option=fc_public_prices`)
      .then(function (response) {
        if (response.data) {
          response.data === "1" ? setPublicPrices(response.data) : setPublicPrices("0")
        }
      })
      .catch(error => console.log(error))
  }, [])

  return !loading ? (
    <>
      {activeState && bestellrundenDates ? (
        <>
          <Box sx={{}}>
            <Grid item xs={12}>
              <Card sx={{ minWidth: 275, borderRadius: 0, backgroundColor: "#f9f9f9", boxShadow: "none", border: "1px solid #f0f0f0" }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    <CelebrationIcon /> {__("Aktuell ist das Bestellfenster geöffnet.", "fcplugin")}
                  </Typography>
                  <Typography variant="body1">
                    {__("Bestellrunde: ", "fcplugin")} {activeBestellrunde} <br />
                    {__("Bestellfenster: ", "fcplugin")} {format(new Date(bestellrundenDates[0]), "dd.MM.yyyy")} bis {format(new Date(bestellrundenDates[1]), "dd.MM.yyyy")} <br />
                    {__("Verteiltag: ", "fcplugin")} {format(new Date(bestellrundenDates[2]), "dd.MM.yyyy")} <br />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Box>
          {frontendLocalizer.currentUser.ID && (
            <Card sx={{ position: "fixed", bottom: 0, left: 0, zIndex: 9999, width: "100%", height: "100px", padding: "20px", backgroundColor: "#f9f9f9", boxShadow: "0 55px 45px 50px rgba(0,0,0,0.25)", border: "1px solid #f0f0f0", marginTop: "20px" }}>
              <Stack direction="row" sx={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start", width: "100%", fontWeight: "bold" }}>
                <Stack sx={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", fontWeight: "bold" }}>
                  <Box>
                    {__("Aktuelle Bestellung:", "fcplugin")} CHF {currentTotal.toFixed(2)}
                  </Box>
                  <Box>
                    {balance >= 0 ? (
                      <>
                        {__("Restliches Guthaben:", "fcplugin")} CHF {balance.toFixed(2)}
                      </>
                    ) : (
                      <span style={{ color: "red" }}>
                        {__("Restliches Guthaben:", "fcplugin")} CHF {balance.toFixed(2)}
                      </span>
                    )}
                  </Box>
                </Stack>
                <Box sx={{ paddingLeft: "60px" }}>
                  {balance < -0.01 || currentTotal === 0 ? (
                    <Button disabled={true} startIcon={<ShoppingCartIcon />} variant="contained">
                      {__("In den Warenkorb", "fcplugin")}
                    </Button>
                  ) : (
                    <LoadingButton loading={addingToCart} loadingPosition="start" startIcon={<ShoppingCartIcon />} variant="contained" onClick={handleAddToCart}>
                      {__("In den Warenkorb", "fcplugin")}
                    </LoadingButton>
                  )}
                </Box>
              </Stack>
            </Card>
          )}
        </>
      ) : (
        <Box sx={{}}>
          <Grid item xs={12}>
            <Card sx={{ minWidth: 275, borderRadius: 0, backgroundColor: "#f9f9f9", boxShadow: "none", border: "1px solid #f0f0f0" }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  <HourglassTopIcon /> {__("Aktuell ist das Bestellfenster geschlossen.", "fcplugin")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Box>
      )}
      <Box sx={{ marginBottom: "100px" }}>
        <MaterialReactTable
          columns={columns}
          data={products ?? []}
          state={{ isLoading: productsLoading, columnVisibility: { id: false, amount: activeState } }}
          localization={MRT_Localization_DE}
          enablePagination={false}
          enableEditing={true}
          editingMode="table"
          enableColumnResizing
          enableFullScreenToggle={false}
          initialState={{ density: "compact", columnVisibility: { id: false, amount: activeState } }}
          //enableStickyHeader
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              borderRadius: "0",
              border: "1px solid #f0f0f0",
              marginTop: "20px"
            }
          }}
          muiTableBodyProps={{
            sx: {
              "& tr:nth-of-type(odd)": {
                backgroundColor: "#f9f9f9"
              },
              marginBottom: "100px"
            }
          }}
          muiTableHeadCellProps={{
            sx: {
              fontWeight: "bold",
              fontSize: "10pt"
            }
          }}
          muiTableBodyCellProps={{
            sx: {
              border: "0",
              fontSize: "10pt"
            }
          }}
          tableInstanceRef={tableInstanceRef}
          muiTableBodyCellEditTextFieldProps={({ cell }) => ({
            onChange: e => {
              handleSaveCell(cell, e.target.value)
            },
            variant: "outlined"
          })}
        />
      </Box>
    </>
  ) : (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <CircularProgress />
    </div>
  )
}

export default OrderList
