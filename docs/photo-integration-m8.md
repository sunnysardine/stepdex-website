# STEPDEX Website 3.0 — Photo integration (Milestone 8)

Status: staging / pending binary image upload and visual testing. Production unchanged.

## Approved assets
- 18 processed workshop photographs, publication authorised by the project owner.
- 54 responsive WebP derivatives (small, medium, large), generated in Milestone 7.
- Original source photographs and approved five cinematic hero scenes must remain unchanged.
- Partner branding on `Leading With Empathy Workshop` must be described as partner branding, not STEPDEX branding.

## Implementation plan
1. Copy the 54 WebP files into `assets/learning/` on `site3`.
2. Integrate selected homepage photographs (04, 07, 10, 14, 18) below the existing cinematic hero sequence, without replacing heroes.
3. Use `picture` or `img` with `srcset`, `sizes`, explicit intrinsic dimensions, descriptive alt text, `loading=lazy` below the fold, and `decoding=async`.
4. Place other photographs in Learning Approach, People & Connections, Learning in Action, Experiential Learning, Facilitation & Coaching, and Gallery sections per the Milestone 7 manifest.
5. Review at 390px, 768px, and 1440px widths; verify navigation, inquiry links, image loading, layout shift and performance.
6. Obtain explicit approval before changing production or Cloudflare routing.

## Asset source
The Milestone 7 asset package is retained in the project conversation; do not substitute stock photography. This document does not assert that binary files have been committed.
