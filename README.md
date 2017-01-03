

To plan!

---

##Local set up

####Install:
 
 - `npm install`
 - `npm install -g rollup`

Some thing that might help if it doesn't work straight off:

 - Check you have a recent version of Node.js
 - `npm install -g node-sass`
 - `npm rebuild node-sass`

####Run:

 - `npm start`


---

#The components:

### `work-space`
A high level container for holding claims & their connections in a mind map style.

### `work-space-connector`
A visual representation of the connections between claims / arguments / anything on the workspace. Essentially, a line.

### `claim-card`
A kind of claim preview, aims to give the most useful information relevant to someone traversing WL.

### `claim-modal`
A higher level container for studying a claim in detail. conversation / word defenitions / things in detail.

### `claim-argument`
A container of claims grouped together to form an argument.

### `search-claims`
A container for finding claims.

### `search-arguments` 
A container for finding relevant argument groups, probably with a focused claim.
