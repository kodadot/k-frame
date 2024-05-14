# Minting frame for Koda-based NFTs

## Dev

```
npm install
npm run dev
```

Head to http://localhost:5173

> [!TIP]
> To obtain some useful value in `/:chain/:id`  do a hack described below 

1. replace `/:chain/:id` with `/`
2. replace `const { chain, id } = c.req.param()`
3. with `const { chain, id } = { chain: "base", id: "0x1b60a7ee6bba284a6aafa1eca0a1f7ea42099373" }`
