# Arweave Permaweb Stamping & Issuance Architecture for VCD Utawala

Permanent Arweave permaweb stamping for the Virtue Classic Dish (VCD) Utawala generative art talisman engine, packaging each 1-of-480 chef edition with Turbo SDK free-tier stamping (<100 KiB) and an automatic ultra-compact Trait JSON fallback for storage efficiency.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Architectural Directives**:
> - **Nomenclature Confirmed**: Standardized on **"Stamp" / "Stamp Edition"** across all user-facing interactions, buttons, notifications, and provenance records.
> - **Dual-Tier Storage Strategy (<100 KiB Free Tier)**:
>   - **Tier 1 (Primary)**: Self-contained standalone SVG markup (~18–35 KiB), directly renderable on Arweave gateway URLs (`https://arweave.net/{txId}`) without external assets.
>   - **Tier 2 (Fallback)**: Compact Trait JSON manifest (~1.2 KiB) containing canonical trait keys, color palette hex codes, edition number, and timestamp. Triggers automatically if SVG size approaches Turbo's free threshold (≥95 KiB) or upon network constraint, maximizing storage efficiency within Turbo's 10 MiB aggregate allowance.
> - **Provenance & Explorer Delivery**: The real Arweave transaction ID (`txId`) is provided immediately at download time with 1-tap links to Arweave Gateway and ViewBlock explorer.

---

### Implementation Progress

- [x] **Step 1: Arweave Stamping Service (`src/services/arweaveService.ts`)**
  - Built `stampToArweave` with `@ardrive/turbo-sdk/web`.
  - Configured zero-friction ephemeral/persistent device key for walletless stamping under Turbo's free tier (<100 KiB per file, up to 10 MiB per address).
  - Implemented Tier 1 (Standalone SVG < 95 KiB) with full ANS-110 metadata tags (`App-Name: VCD-Utawala`, `Type: talisman`, `License: CC0-1.0`, canonical trait identifiers).
  - Implemented Tier 2 (Compact Trait JSON ~1.2 KiB) for maximum storage efficiency when payload is large or under network constraint.
  - Implemented Tier 3 (Deterministic SHA-256 anchor) for offline reliability so patrons can still claim and download assets uninterrupted.

- [x] **Step 2: Thumb Controls & Nomenclature Update (`src/components/ThumbControls.tsx`)**
  - Updated action button to **Stamp** with `Stamp` icon from `lucide-react`.
  - Added active state indicator: spinner + `"Stamping..."` during permaweb broadcast.
  - Preserved mobile ergonomics with no overlapping elements.

- [x] **Step 3: Stamping Pipeline in Studio (`src/App.tsx`)**
  - Linked `handleStampWorkflow` to trigger high-res 3000px PNG and standalone SVG downloads alongside Arweave broadcast.
  - Updated local 480-combination registry with `state: 'issued'`, `claimedAt`, `txId`, and `storageFormat`.
  - Added rich toast notification displaying Arweave Gateway URL (`arweave.net/{txId}`), ViewBlock explorer (`viewblock.io/arweave/tx/{txId}`), and payload format indicator (`SVG` or `Trait JSON`).

- [x] **Step 4: Curatorial Drawer & Registry Matrix Integration**
  - Added Arweave stamp provenance card with 1-tap copy of transaction ID and direct explorer links in `CuratorialDrawer.tsx`.
  - Added "Stamp Edition" action directly within the drawer if the combination has not yet been stamped.
  - Enhanced `RegistryMatrix.tsx` inspector with permanent Arweave stamp badge and gateway/ViewBlock links for issued editions.

- [x] **Step 5: Compilation & Linting Verification**
  - `compile_applet` passed successfully.
  - `lint_applet` passed with zero errors (`tsc --noEmit`).
