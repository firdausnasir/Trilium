# Customize the Next theme
By default, any custom theme will be based on the legacy light theme. To use the TriliumNext theme instead, add the `#appThemeBase=next` attribute onto the existing theme. The `appTheme` attribute must also be present.

![](Customize%20the%20Next%20theme_image.png)

The `appThemeBase` label can be set to one of the following values:

*   `next`, for the TriliumNext (auto light or dark mode).
*   `next-light`, for the always light mode of the TriliumNext.
*   `next-dark`, for the always dark mode of the TriliumNext.
*   Any other value is ignored and will use the legacy white theme instead.

## Overrides

Knowledge Studio semantic tokens are available to custom themes that inherit Next. Scope overrides to `#trilium-app` so they take precedence over the base theme. For example, `--ks-shell-color` controls the shared shell color, including both launcher orientations:

```css
#trilium-app {
    --ks-shell-color: #0d6efd;
}
```