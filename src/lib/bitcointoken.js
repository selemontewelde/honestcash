!function(t,a){"object"==typeof exports&&"undefined"!=typeof module?a(exports,require("bitcoinsource"),require("axios")):"function"==typeof define&&define.amd?define(["exports","bitcoinsource","axios"],a):a((t["bitcoin-token-umd"]=t["bitcoin-token-umd"]||{},t["bitcoin-token-umd"].js={}),t.BitcoinSource,t.axios)}(this,function(t,a,e){"use strict";a=a&&a.hasOwnProperty("default")?a.default:a,e=e&&e.hasOwnProperty("default")?e.default:e;var s={BITCOIN_NETWORK:"mainnet",BLOCK_EXPLORER_URL:"https://bch.blockdozer.com/api",MIN_SATOSHI_AMOUNT:5e3,UN_P2SH_URL:"http://localhost:3000",DEFAULT_FEE:1e4};function r(t){return Buffer.from(t)}function n(t){return t.toString()}a.versionGuard=(()=>!0),a.Networks.defaultNetwork=a.Networks[s.BITCOIN_NETWORK];class i{constructor(t,a,e){this.publicKeys=a||[],this.data=t||[],this.amount=e||s.MIN_SATOSHI_AMOUNT}getData(t){return this.data[t]}getSerializeData(){return Object.entries(this.data).reduce((t,a)=>t.concat(a),[]).map(r)}setSerializedData(t){const a=t.map(n),e={};for(let t=0;t<a.length;t+=2)e[a[t]]=a[t+1];this.data=e}toJSON(){return{data:this.data,publicKeys:this.publicKeys.map(t=>t.toString()),amount:this.amount}}}const{Address:u,PublicKey:o,Signature:c,Script:d,Opcode:h}=a;class l extends d{static buildDataOut(t){const{publicKeys:a}=t,e=t.getSerializeData(),s=new l;return s.add("OP_1"),a.forEach(t=>s.add(t.toBuffer())),s.add(`OP_${a.length}`),s.add("OP_CHECKMULTISIG"),e.forEach(t=>s.add(t).add("OP_DROP")),s}static buildDataIn(t,a,e,s){const r=new l;return e.forEach(t=>{r.add(t)}),r.add(s),r}isData(){return!(!(this.chunks.length>=5&&this.chunks[0].opcodenum===h.OP_1&&this.chunks[1].buf)||20!==this.chunks[1].buf.length&&33!==this.chunks[1].buf.length||this.chunks[2].opcodenum!==h.OP_1||this.chunks[3].opcodenum!==h.OP_CHECKMULTISIG||!this.chunks[4].buf||this.chunks[5].opcodenum!==h.OP_DROP)}static isP2shScript(t){return!(3!==t.chunks.length||t.chunks[0].opcodenum!==h.OP_0||!t.chunks[1].buf||!t.chunks[2].buf)}static getRedeemScript(t){if(!this.isP2shScript(t))return null;const a=new d(t.chunks[2].buf),e=new l;return e.chunks=a.chunks,e}toData(){if(!this.isData())return"no_data";const t=new i({},[new o(this.chunks[1].buf)],s.MIN_SATOSHI_AMOUNT),a=this.chunks.slice(4,this.chunks.length).filter((t,a)=>a%2==0).map(t=>t.buf);return t.setSerializedData(a),t}}class p extends Error{constructor(t,a,...e){super(...e),this.name="TokenError",this.message=t+(a?`: ${a}`:""),Error.captureStackTrace&&Error.captureStackTrace(this,p)}}const y=async t=>{try{return(await t).data}catch(t){if(t.response){const{status:a,statusText:e,data:s}=t.response,r=s.error||(-1!==s.indexOf("Code:")?s:e);throw new p("Communication error",`${e}. Failed with status ${a}. Txo: ${r}.`)}throw new p("Communication error","Service unavailable.")}},w=async(t,a=s.BLOCK_EXPLORER_URL)=>y(e.get(`${a}${t}`)),g=async(t,a,r=s.BLOCK_EXPLORER_URL)=>y(e.post(`${r}${t}`,a)),b=async t=>{const{balanceSat:a,unconfirmedBalanceSat:e}=await(async t=>w(`/addr/${t.toString()}`))(t);return a+e},f=async t=>g("/tx/send",{rawtx:t.toString()}),m=async t=>{return(await w(`/rawtx/${t}`)).rawtx},O=async t=>{const a=t.toString();return(t=>t.filter((t,a,e)=>e.findIndex(a=>a.txid===t.txid&&a.vout===t.vout)===a))(await w(`/addr/${a}/utxo`)).map(t=>(t.spent=!1,t))},P=async t=>{const a=await(async t=>w(`/tx/${t}`))(t.txId),e=a.vout[t.outputNumber],s=e.scriptPubKey.addresses[0],r=t.txId,n=t.outputNumber,i=parseFloat(e.value),u=1e8*i,o=a.blockheight,{confirmations:c}=a,d=!!e.spentTxId&&e.spentTxId;return{address:s,txid:r,vout:n,scriptPubKey:e.scriptPubKey.hex,amount:i,satoshis:u,height:o,confirmations:c,spent:d}},_=async t=>g("/",t,s.UN_P2SH_URL),K=async t=>w(`/un-p2sh/${t}`,s.UN_P2SH_URL),S=async t=>w(`/txos/${t}`,s.UN_P2SH_URL),x=async(t,a)=>g("/txos/set-spent/",{txId:t,vOut:a},s.UN_P2SH_URL),{Transaction:v,PublicKey:D,Address:I,BN:T,Script:A,encoding:E}=a,{Output:k,Input:U}=v,{MultiSigScriptHash:H}=U,{BufferReader:N}=E;class L extends v{constructor(t){super(t),this._dataOutputs=[],Object.defineProperty(this,"to",{writable:!0,value:this._to})}get dataInputs(){return this.inputs.map(t=>(t.redeemScript=t.redeemScript||l.getRedeemScript(l.fromBuffer(t._scriptBuffer)),t.redeemScript?t.redeemScript.toData():"no_data"))}set dataInputs(t){throw Error("dataTransaction.dataInputs cannot be set directly, use dataTransaction.from or dataTransaction.fromData")}get inputsWithData(){return this.inputs.filter((t,a)=>"no_data"!==this.dataInputs[a])}fromData(t,a){const e=l.buildDataOut(a),s=new H({output:new k({script:new l(t.scriptPubKey),satoshis:t.satoshis}),prevTxId:t.txid,outputIndex:t.vout,script:new l},a.publicKeys,1,null,e);return this.addInput(s),this}get dataOutputs(){if(!this._dataOutputs.length)throw new Error("dataTransaction.dataOutputs is not initialized. Try calling dataTransaction.fetchDataOuptuts() first.");return this._dataOutputs.map(t=>"no_data"===t?t:new i(t.data,t.publicKeys))}set dataOutputs(t){throw Error("dataTransaction.dataInputs cannot be set directly, use dataTransaction.toData")}get outputsWithData(){return this.outputs.filter((t,a)=>"no_data"!==this.dataOutputs[a])}_to(t,a){return this._dataOutputs.push("no_data"),super.to(t,a)}change(t){const a=this.outputs.length;return super.change(t),this.outputs.length>a&&this._dataOutputs.push("no_data"),this}toData(t){const a=l.buildDataOut(t),e=l.buildScriptHashOut(a),s=new k({script:e,satoshis:t.amount});return this.addOutput(s),this._dataOutputs.push(t),this}async fetchDataOutputs(){if(this._dataOutputs.length)return this._dataOutputs;const t=this.getId(),a=await K(t);if(!a)throw new Error(`Cannot find output string for txId ${t} in database`);return this._dataOutputs=a.map(t=>"no_data"===t?"no_data":new i(t.data,t.publicKeys.map(D.fromString))),this._dataOutputs}getId(){return new N(this._getHash()).readReverse().toString("hex")}static async fromTxId(t){const a=await m(t),e=new L;return await e.fromString(a),e}}const{HDPrivateKey:R,PrivateKey:B,PublicKey:j,Address:F}=a;class ${constructor(t){this.hdPrivateKey=t||new R}derive(t=0,a=!0){return new $(this.hdPrivateKey.derive(t,a))}static getHdPrivateKey(){return new R}getPrivateKey(){return this.hdPrivateKey.privateKey}getPublicKey(){return this.hdPrivateKey.publicKey}getAddress(){return this.address=this.address||this.getPublicKey().toAddress(),this.address}async getBalance(){const t=this.getAddress();return b(t.toString())}async getUtxosFromAddress(t,a){const e=await O(t.toString());let s=0;const r=[];let n=0;for(;s<a&&n<e.length;)r.push(e[n]),s+=e[n].satoshis,n+=1;if(s<a)throw new Error(`Insufficient balance in address ${t.toString()}`);return r}async getUtxos(t){const a=this.getAddress();return this.getUtxosFromAddress(a,t)}async getTokenUtxos(){const t=this.getPublicKey(),a=await S(t.toString());return Promise.all(a.map(async t=>{const a=await L.fromTxId(t.txId),e=(await a.fetchDataOutputs())[t.vOut];if(e){const s=l.buildDataOut(e),r=l.buildScriptHashOut(s),n=a.outputs[t.vOut].satoshis;return{txid:t.txId,vout:t.vOut,scriptPubKey:r,amount:Math.round(n/1e8),satoshis:n,amountSat:n,dataOutput:e}}return null}))}async sendTransaction(t,a=!1){const e=await f(t);if(a){const a={txId:e.txid,outputData:JSON.stringify(t.dataOutputs)};await _(a)}return e}async send(t,a,e){const r=e||this.getAddress(),n=s.DEFAULT_FEE,i=this.getPrivateKey(),u=await this.getUtxos(t+n),o=(new L).from(u).to(a,t).change(r).sign(i);return this.sendTransaction(o)}async sendAll(t){const a=await this.getBalance();if(a>s.DEFAULT_FEE){const e=s.DEFAULT_FEE;return this.send(a-e,t,t)}return{}}}const{HDPrivateKey:M,PublicKey:C}=a;class W{constructor(t){this.wallet=t||new $}static fromHdPrivateKey(t){return new this(new $(t))}async put(t){return this.update([],t)}async get(t){return Promise.all(t.map(async t=>{const{txId:a,outputNumber:e}=t,s=await L.fromTxId(a);return await s.fetchDataOutputs(),s.dataOutputs[e]}))}async update(t,a){const e=new L;await Promise.all(t.map(async t=>{const a=await P(t),s=(await K(a.txid))[a.vout],{publicKeys:r,data:n}=s,u=r.map(t=>new C(t));await x(a.txid,a.vout),e.fromData(a,new i(n,u))}));const s=await this.wallet.getUtxos(15e3);e.from(s);for(const t of a)e.toData(t);e.change(this.wallet.getAddress()),e.sign(this.wallet.getPrivateKey());const r=await this.wallet.sendTransaction(e,!0);return[...Array(a.length).keys()].map(t=>({txId:r.txid,outputNumber:t}))}}class z{constructor(t){this.db=t||new W}static fromHdPrivateKey(t){return new this(W.fromHdPrivateKey(t))}async init(t){const a=Object.getPrototypeOf(async()=>{}).constructor;Object.entries(t).forEach(([t,e])=>{this[t]=new a(`"use strict"; return ${e}`).bind(this)()})}async create(t){const a=new i(t,[this.db.wallet.getPublicKey()]);return this.id=(await this.db.put([a]))[0],this.id}join(t){this.id=t}async getTokenUtxos(){const t=this.db.wallet.getPublicKey(),a=await S(t.toString()),e=(await Promise.all(a.map(async t=>{const a=await L.fromTxId(t.txId);return await a.fetchDataOutputs(),Object.assign({transaction:a},t)}))).filter(t=>t.transaction.dataOutputs[t.vOut]),s=await((t,a)=>Promise.all(t.map(t=>a(t))).then(a=>t.filter(t=>a.shift())))(e,(async t=>this.isValid(t.transaction.hash)).bind(this));return Promise.all(s.map(async t=>{const a=t.transaction.dataOutputs[t.vOut],e=l.buildDataOut(a),s=l.buildScriptHashOut(e),r=t.transaction.outputs[t.vOut].satoshis;return{txid:t.txId,vout:t.vOut,scriptPubKey:s,amount:Math.round(r/1e8),satoshis:r,amountSat:r,dataOutput:a}}))}async send(t,a){const e=await this.getTokenUtxos();let s=0;const r=e.filter(async a=>{const e=s<t,{txid:r,vout:n,dataOutput:i}=a,{balance:u}=i.data;return s+=u?parseInt(u,10):0,await x(r,n),e}).map(t=>({txId:t.txid,outputNumber:t.vout}));if(s<t)throw new Error("Insufficient token funds");const n=new i({balance:t.toString(10)},[a]),u=s-t,o=this.db.wallet.getPublicKey(),c=new i({balance:u.toString(10)},[o]);return this.db.update(r,[n,c])}async getBalance(){const t=await this.getTokenUtxos();return(await Promise.all(t.map(async t=>{const a=await K(t.txid),{publicKeys:e,data:s}=a[t.vout],r=new i(s,e).getData("balance");return r?parseInt(r,10):0}))).reduce((t,a)=>t+a,0)}async isValid(t){const a=await L.fromTxId(t);return await a.fetchDataOutputs(),this.isIssuance(a)?this.id.txId===a.getId():!!this.isTransfer(a)&&Promise.all(a.inputsWithData.map(async t=>this.isValid(t.prevTxId.toString("hex")))).then(t=>t.every(t=>t))}isIssuance(t){return 0===t.inputsWithData.length&&1===t.outputsWithData.length}isTransfer(t){return t.inputsWithData.length>=1}}const{Address:G,HDPrivateKey:V}=a;class X{constructor(){this.wallet=new $}static fromHdPrivateKey(t){const a=new X,e=V.fromString(t);return a.wallet=new $(e),a}derive(t=0,a=!0){const e=new X,s=this.wallet.derive(t,a);return e.wallet=s,e}getPrivateKey(){return this.wallet.getPrivateKey().toString()}getPublicKey(){return this.wallet.getPublicKey().toString()}getAddress(t){const a=t||"bitpay";if(!["legacy","bitpay","cashaddr"].includes(a))throw new Error("'format' parameter in wallet.getAddress must be 'legacy', 'bitpay', or 'cashaddr'");return this.wallet.getAddress().toString(a)}async getBalance(){return this.wallet.getBalance()}async send(t,a,e){const s=new G(a,"testnet"),r=e?new G(e,"testnet"):this.wallet.getAddress();return this.wallet.send(t,s,r)}static getHdPrivateKey(){return $.getHdPrivateKey().toString()}}const{HDPrivateKey:q,PublicKey:J}=a;class Q{constructor(t){this.db=new W(t?t.wallet:null)}static fromHdPrivateKey(t){const a=new Q,e=q.fromString(t);return a.db=W.fromHdPrivateKey(e),a}_toOutputData(t){const{data:a,amount:e}=t,s=t.owners?t.owners.map(t=>new J(t)):[this.db.wallet.getPublicKey()];return new i(a,s,e)}_fromOutputData(t){return{data:t.data,owners:t.publicKeys.map(t=>t.toString()),amount:t.amount||s.MIN_SATOSHI_AMOUNT}}async putObject(t,a,e=s.DEFAULT_FEE){const r={data:t,owners:a,amount:e};return(await this.db.put([this._toOutputData(r)]))[0]}async putArray(t){return this.db.put(t.map(this._toOutputData.bind(this)))}async put(t,a,e=s.DEFAULT_FEE){return Array.isArray(t)?this.putArray(t):this.putObject(t,a||[this.getPublicKey()],e)}async getObject(t){const[a]=await this.db.get([t]);return"no_data"===a?{data:{},owners:[],amount:0}:this._fromOutputData(a)}async getArray(t){return(await this.db.get(t)).map(t=>"no_data"===t?{data:{},owners:[],amount:0}:this._fromOutputData(t))}async get(t){return Array.isArray(t)?this.getArray(t):this.getObject(t)}async updateArray(t,a){return this.db.update(t,a.map(this._toOutputData.bind(this)))}async updateObject(t,a,e,r=s.DEFAULT_FEE){const n={data:a,owners:e,amount:r};return(await this.db.update([t],[this._toOutputData(n)]))[0]}async update(t,a,e,s){if(Array.isArray(t)&&Array.isArray(a))return this.updateArray(t,a);if(!Array.isArray(t)&&!Array.isArray(a))return this.updateObject(t,a,e||[this.getPublicKey()],s);throw new Error("Parameters to db.update must either all be objects or both be strings.")}static getHdPrivateKey(){return X.getHdPrivateKey()}getPublicKey(){return this.db.wallet.getPublicKey().toString()}}const{PublicKey:Y,HDPrivateKey:Z}=a;class tt{constructor(t){this.token=new z(t?t.db:null)}static fromHdPrivateKey(t){const a=Z.fromString(t),e=new tt;return e.token=z.fromHdPrivateKey(a),e}async create(t){return this.token.create(t)}join(t){return this.token.join(t)}async send(t,a){const e=Y.fromString(a);return this.token.send(t,e)}async getBalance(){return this.token.getBalance()}getPublicKey(){return this.token.db.wallet.getPublicKey().toString()}}t.Token=tt,t.Db=Q,t.Wallet=X,Object.defineProperty(t,"__esModule",{value:!0})});
