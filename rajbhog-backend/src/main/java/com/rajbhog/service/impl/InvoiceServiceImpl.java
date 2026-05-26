package com.rajbhog.service.impl;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.DashedBorder;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.rajbhog.dto.response.OrderEmailDto;
import com.rajbhog.enums.PaymentMethod;
import com.rajbhog.service.InvoiceService;

/*
 * FONTS NOTE: Standard Helvetica is used for compatibility.
 * The rupee symbol (Rs.) is used in place of ₹ (\u20B9).
 * To render ₹ natively, embed a Unicode font:
 *   PdfFontFactory.createFont("classpath:fonts/NotoSans-Regular.ttf",
 *                              PdfEncodings.IDENTITY_H, true)
 *
 * IMAGES NOTE: Place seal.png and signature.png inside
 *   src/main/resources/static/invoice/
 * They are loaded via ClassLoader at runtime.
 */
@Service
public class InvoiceServiceImpl implements InvoiceService {

    /* ═══════════════════════════════════════════════════════════════
       BRAND COLOR PALETTE
    ═══════════════════════════════════════════════════════════════ */
    private static final Color BRAND_DARKEST  = new DeviceRgb(30,  10,   2);
    private static final Color BRAND_DARK     = new DeviceRgb(61,  30,   8);
    private static final Color BRAND_MID      = new DeviceRgb(111, 59,  24);
    private static final Color BRAND_LIGHT    = new DeviceRgb(253, 240, 230);
    private static final Color BRAND_BORDER   = new DeviceRgb(232, 201, 160);
    private static final Color ACCENT_SAFFRON = new DeviceRgb(191, 103,  13);
    private static final Color ACCENT_GOLD    = new DeviceRgb(217, 160,  80);
    private static final Color WHITE          = new DeviceRgb(255, 255, 255);
    private static final Color TEXT_PRIMARY   = new DeviceRgb(30,  17,  10);
    private static final Color TEXT_SECOND    = new DeviceRgb(107, 76,  59);
    private static final Color TEXT_MUTED     = new DeviceRgb(168, 137, 110);
    private static final Color GREEN_DARK     = new DeviceRgb(21,  128,  61);
    private static final Color GREEN_LIGHT    = new DeviceRgb(240, 253, 244);
    private static final Color ROW_STRIPE     = new DeviceRgb(253, 248, 243);
    private static final Color SURFACE        = new DeviceRgb(250, 247, 244);

    /* ═══════════════════════════════════════════════════════════════
       MAIN METHOD
    ═══════════════════════════════════════════════════════════════ */
    @Override
    public byte[] generateInvoiceFromDto(OrderEmailDto order) {

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PdfWriter   writer = new PdfWriter(baos);
            PdfDocument pdf    = new PdfDocument(writer);

            // A4 page — bottom margin reduced to 10 to reclaim space
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(0, 38, 10, 38);

            // ── Fonts ──────────────────────────────────────────────────
            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont bold    = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont italic  = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            String today = LocalDate.now()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

            // ── Load images ────────────────────────────────────────────
            Image sealImage      = loadImage("static/invoice/seal.png");
            Image signatureImage = loadImage("static/invoice/signature.png");

            // ─────────────────────────────────────────────────────────
            //  SECTION 1 — HERO HEADER BAR
            //  Padding reduced: 26 → 18 to save ~16pt of height
            // ─────────────────────────────────────────────────────────
            Table header = new Table(UnitValue.createPercentArray(new float[]{58, 42}))
                    .useAllAvailableWidth()
                    .setMarginLeft(-38).setMarginRight(-38);

            Table brandBlock = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .useAllAvailableWidth();

            Table nameTagRow = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                    .useAllAvailableWidth();

            nameTagRow.addCell(new Cell()
                    .add(para("RAJBHOG", bold, 28f, WHITE).setCharacterSpacing(5))
                    .add(para("Jo bhi khaye, dost ban jaye", italic, 8f, ACCENT_GOLD)
                            .setMarginBottom(3).setMarginLeft(50))
                    .setBorder(Border.NO_BORDER)
                    .setPadding(0)
                    .setVerticalAlignment(VerticalAlignment.BOTTOM));

            nameTagRow.addCell(new Cell()
                    .add(para("\u091C\u094B \u092D\u0940 \u0916\u093E\u090F,", italic, 8.5f, ACCENT_GOLD)
                            .setMarginBottom(0))
                    .add(para("\u0926\u094B\u0938\u094D\u0924 \u092C\u0928 \u091C\u093E\u090F", italic, 8.5f, ACCENT_GOLD)
                            .setMarginTop(1))
                    .setBorder(Border.NO_BORDER)
                    .setPadding(0).setPaddingLeft(8).setPaddingBottom(2)
                    .setVerticalAlignment(VerticalAlignment.BOTTOM));

            brandBlock.addCell(new Cell()
                    .add(nameTagRow)
                    .setBorder(Border.NO_BORDER)
                    .setPadding(0).setMarginBottom(4));   // was 6

            brandBlock.addCell(new Cell()
                    .add(para("Trusted Kirana Store", italic, 9.5f, ACCENT_GOLD).setMarginBottom(3))  // was 10f, mb4
                    .add(para("PURE  \u00B7  TRUSTED  \u00B7  HONEST", regular, 7f, TEXT_MUTED)
                            .setCharacterSpacing(1.2f))
                    .setBorder(Border.NO_BORDER)
                    .setPadding(0));

            // Header cell padding: 26 → 18 top/bottom
            header.addCell(new Cell()
                    .add(brandBlock)
                    .setBackgroundColor(BRAND_DARK)
                    .setBorder(Border.NO_BORDER)
                    .setPaddingTop(18).setPaddingBottom(18)
                    .setPaddingLeft(44).setPaddingRight(16)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE));

            header.addCell(new Cell()
                    .add(para("TAX INVOICE", bold, 13f, ACCENT_SAFFRON)
                            .setCharacterSpacing(2.5f).setTextAlignment(TextAlignment.RIGHT))
                    .add(para("ORIGINAL COPY", regular, 7f, TEXT_MUTED)
                            .setCharacterSpacing(1f).setTextAlignment(TextAlignment.RIGHT).setMarginTop(3))
                    .add(para("#" + order.getOrderNumber(), bold, 11f, ACCENT_GOLD)
                            .setTextAlignment(TextAlignment.RIGHT).setMarginTop(6))
                    .setBackgroundColor(BRAND_DARK)
                    .setBorder(Border.NO_BORDER)
                    .setPaddingTop(18).setPaddingBottom(18)
                    .setPaddingRight(44).setPaddingLeft(16)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE));

            doc.add(header);

            // ── Saffron accent strip ──
            Table accentStrip = new Table(1).useAllAvailableWidth()
                    .setMarginLeft(-38).setMarginRight(-38);
            accentStrip.addCell(new Cell()
                    .add(para(" ", regular, 1f, WHITE))
                    .setBackgroundColor(ACCENT_SAFFRON)
                    .setBorder(Border.NO_BORDER)
                    .setPadding(0).setHeight(3));          // was 4
            doc.add(accentStrip);

            // ─────────────────────────────────────────────────────────
            //  SECTION 2 — ORDER META STRIP
            //  Padding reduced: 12 → 8
            // ─────────────────────────────────────────────────────────
            Table metaStrip = new Table(UnitValue.createPercentArray(new float[]{34, 33, 33}))
                    .useAllAvailableWidth()
                    .setMarginLeft(-38).setMarginRight(-38);

            metaStrip.addCell(new Cell()
                    .add(para("ORDER NUMBER", bold, 7f, TEXT_MUTED).setCharacterSpacing(1.2f))
                    .add(para("#" + order.getOrderNumber(), bold, 11f, BRAND_MID).setMarginTop(3))
                    .setBackgroundColor(BRAND_LIGHT)
                    .setBorder(Border.NO_BORDER)
                    .setBorderRight(new SolidBorder(BRAND_BORDER, 1))
                    .setPadding(8).setPaddingLeft(44));    // was 12

            metaStrip.addCell(new Cell()
                    .add(para("DATE", bold, 7f, TEXT_MUTED).setCharacterSpacing(1.2f))
                    .add(para(today, bold, 11f, TEXT_PRIMARY).setMarginTop(3))
                    .setBackgroundColor(BRAND_LIGHT)
                    .setBorder(Border.NO_BORDER)
                    .setBorderRight(new SolidBorder(BRAND_BORDER, 1))
                    .setPadding(8));                       // was 12

            metaStrip.addCell(new Cell()
                    .add(para("STATUS", bold, 7f, TEXT_MUTED).setCharacterSpacing(1.2f))
                    .add(para(order.getOrderStatus().name(), bold, 11f, GREEN_DARK).setMarginTop(3))
                    .setBackgroundColor(BRAND_LIGHT)
                    .setBorder(Border.NO_BORDER)
                    .setPadding(8).setPaddingRight(44));   // was 12

            doc.add(metaStrip);
            doc.add(hLine(BRAND_BORDER, 1));

            // ─────────────────────────────────────────────────────────
            //  SECTION 3 — BILL TO  +  PAYMENT DETAILS
            //  vSpace: 11 → 6 | cell padding: 13 → 9
            // ─────────────────────────────────────────────────────────
            doc.add(vSpace(6));                            // was 11

            Table infoRow = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth();

            String custName  = nvl(order.getCustomerName(), "Customer");
            String email     = nvl(order.getCustomerEmail(), "N/A");
            String address   = nvl(order.getAddress(), "N/A");
            String txnId     = nvl(order.getTransactionId(), "N/A");
            String payMethod = nvl(
                    order.getPaymentMethod() != null
                            ? order.getPaymentMethod().name().replace("_", " ")
                            : null,
                    "Cash on Delivery");

            // BILL TO
            infoRow.addCell(new Cell()
                    .add(para("BILL TO", bold, 7f, TEXT_MUTED).setCharacterSpacing(1.5f))
                    .add(para(custName, bold, 11f, TEXT_PRIMARY).setMarginTop(4))
                    .add(para(email, regular, 8.5f, TEXT_SECOND).setMarginTop(2))
                    .add(para(address, regular, 8.5f, TEXT_SECOND)
                            .setMultipliedLeading(1.45f).setMarginTop(2))
                    .setBackgroundColor(BRAND_LIGHT)
                    .setBorder(new SolidBorder(BRAND_BORDER, 1))
                    .setPadding(9)                         // was 13
                    .setMarginRight(6)
                    .setVerticalAlignment(VerticalAlignment.TOP));
            
            String payStatus;

            if (order.getPaymentMethod() != PaymentMethod.COD) {
                payStatus = "PAID"; // ONLINE
            } else {
                payStatus = order.getPaymentStatus() != null
                        ? order.getPaymentStatus().name()
                        : "PENDING";
            }

            Color statusColor = payStatus.equalsIgnoreCase("PAID")
                    ? GREEN_DARK
                    : new DeviceRgb(180, 83, 9);

            // PAYMENT DETAILS
            infoRow.addCell(new Cell()
                    .add(para("PAYMENT DETAILS", bold, 7f, TEXT_MUTED).setCharacterSpacing(1.5f))
                    .add(para(payMethod, bold, 10.5f, TEXT_PRIMARY).setMarginTop(4))
                    .add(vSpacePara(3))
                    .add(para("TRANSACTION ID", bold, 7f, TEXT_MUTED).setCharacterSpacing(1f))
                    .add(para(txnId, bold, 9f, BRAND_MID).setMarginTop(1))
                    .add(vSpacePara(3))
                    .add(para("PAYMENT STATUS", bold, 7f, TEXT_MUTED).setCharacterSpacing(1f))
                    .add(para(payStatus, bold, 9.5f, statusColor).setMarginTop(1))  // ✅ FIX HERE
                    .add(vSpacePara(3))
                    .add(para("INVOICE TYPE", bold, 7f, TEXT_MUTED).setCharacterSpacing(1f))
                    .add(para("Original — Computer Generated", regular, 8.5f, TEXT_SECOND).setMarginTop(1))
                    .setBorder(new SolidBorder(BRAND_BORDER, 1))
                    .setPadding(9)
                    .setMarginLeft(6)
                    .setVerticalAlignment(VerticalAlignment.TOP));

            doc.add(infoRow);

            // ─────────────────────────────────────────────────────────
            //  SECTION 4 — ITEMS TABLE
            //  vSpace: 20 → 8 | cell padding: 9 → 7
            // ─────────────────────────────────────────────────────────
            doc.add(vSpace(8));                            // was 20

            doc.add(para("ITEMS ORDERED", bold, 7.5f, TEXT_MUTED)
                    .setCharacterSpacing(2f).setMarginBottom(5));  // was mb 7

            Table items = new Table(UnitValue.createPercentArray(new float[]{44, 16, 10, 15, 15}))
                    .useAllAvailableWidth();

            String[]        colLabels = {"PRODUCT NAME", "UNIT / PACK", "QTY", "UNIT PRICE", "AMOUNT"};
            TextAlignment[] als       = {TextAlignment.LEFT, TextAlignment.CENTER, TextAlignment.CENTER,
                                         TextAlignment.RIGHT, TextAlignment.RIGHT};

            for (int c = 0; c < colLabels.length; c++) {
                items.addHeaderCell(new Cell()
                        .add(para(colLabels[c], bold, 8f, WHITE)
                                .setCharacterSpacing(0.5f).setTextAlignment(als[c]))
                        .setBackgroundColor(BRAND_MID)
                        .setBorderTop(Border.NO_BORDER)
                        .setBorderLeft(Border.NO_BORDER)
                        .setBorderRight(Border.NO_BORDER)
                        .setBorderBottom(new SolidBorder(ACCENT_SAFFRON, 2f))
                        .setPaddingTop(7).setPaddingBottom(7)       // was 9
                        .setPaddingLeft(c == 0 ? 13 : 8)
                        .setPaddingRight(c == colLabels.length - 1 ? 13 : 8));
            }

            int rowNum = 0;
            for (OrderEmailDto.Item item : order.getItems()) {
                Color rowBg = (rowNum % 2 == 0) ? WHITE : ROW_STRIPE;
                SolidBorder rb = new SolidBorder(BRAND_BORDER, 0.5f);

                String name  = nvl(item.getName(), "—");
                String unit  = nvl(item.getUnit(), "—");
                String qty   = String.valueOf(item.getQuantity());
                String price = "Rs. " + item.getPrice();

                items.addCell(rowCell(name,  bold,    9.5f, TEXT_PRIMARY, rowBg, rb, TextAlignment.LEFT,   13, 8));
                items.addCell(rowCell(unit,  regular, 9f,   TEXT_SECOND,  rowBg, rb, TextAlignment.CENTER, 8,  8));
                items.addCell(rowCell(qty,   bold,    9.5f, TEXT_PRIMARY, rowBg, rb, TextAlignment.CENTER, 8,  8));
                items.addCell(rowCell(price, regular, 9f,   TEXT_SECOND,  rowBg, rb, TextAlignment.RIGHT,  8,  8));
                items.addCell(rowCell(price, bold,    9.5f, TEXT_PRIMARY, rowBg, rb, TextAlignment.RIGHT,  8,  13));

                rowNum++;
            }

            doc.add(items);

            // ─────────────────────────────────────────────────────────
            //  SECTION 5 — BILL SUMMARY  +  TRUST TEXT
            //  vSpace: 14 → 7 | cell padding: 16 → 10
            // ─────────────────────────────────────────────────────────
            doc.add(vSpace(7));                            // was 14

            Table summaryRow = new Table(UnitValue.createPercentArray(new float[]{52, 48}))
                    .useAllAvailableWidth();

            summaryRow.addCell(new Cell()
                    .add(para("Why Families Trust RAJBHOG", bold, 10f, BRAND_MID).setMarginBottom(5))
                    .add(para(
                            "Every product in your order has been carefully sourced, "
                          + "quality-checked, and packed with care before it reaches "
                          + "your doorstep. Honest pricing. Pure products.",
                            italic, 8.5f, TEXT_SECOND).setMultipliedLeading(1.5f).setMarginBottom(9))
                    .add(buildTrustRow(bold, regular))
                    .setBackgroundColor(BRAND_LIGHT)
                    .setBorder(new SolidBorder(BRAND_BORDER, 1))
                    .setPadding(10)                        // was 16
                    .setMarginRight(8)
                    .setVerticalAlignment(VerticalAlignment.TOP));

            Table billSummary = new Table(UnitValue.createPercentArray(new float[]{55, 45}))
                    .useAllAvailableWidth();

            billSummaryRow(billSummary, bold, regular, "Subtotal",
                    "Rs. " + order.getSubtotal(), TEXT_SECOND, TEXT_SECOND, WHITE, false);
            billSummaryRow(billSummary, bold, regular, "Delivery Charges",
                    "Rs. " + order.getDelivery(), TEXT_SECOND, TEXT_SECOND, ROW_STRIPE, false);
            billSummaryRow(billSummary, bold, regular, "Discount Applied",
                    "- Rs. " + order.getDiscount(), GREEN_DARK, GREEN_DARK, GREEN_LIGHT, false);

            billSummary.addCell(dashedDividerCell());
            billSummary.addCell(dashedDividerCell());

            billSummaryRow(billSummary, bold, regular, "TOTAL PAYABLE",
                    "Rs. " + order.getTotal(), TEXT_PRIMARY, BRAND_MID, BRAND_LIGHT, true);

            summaryRow.addCell(new Cell()
                    .add(billSummary)
                    .setBorder(new SolidBorder(BRAND_BORDER, 1))
                    .setPadding(0)
                    .setMarginLeft(8));

            doc.add(summaryRow);

            // ─────────────────────────────────────────────────────────
            //  SECTION 6 — SEAL  +  SIGNATURE
            //  vSpace: 12 → 6
            // ─────────────────────────────────────────────────────────
            doc.add(vSpace(6));                            // was 12

            Table sealSigRow = new Table(UnitValue.createPercentArray(new float[]{30, 40, 30}))
                    .useAllAvailableWidth();

            sealSigRow.addCell(new Cell()
                    .add(para("This is an electronically generated invoice and", regular, 7f, TEXT_MUTED)
                            .setMultipliedLeading(1.45f))
                    .add(para("does not require a physical signature.", regular, 7f, TEXT_MUTED)
                            .setMultipliedLeading(1.45f))
                    .setBorder(Border.NO_BORDER)
                    .setVerticalAlignment(VerticalAlignment.BOTTOM)
                    .setPaddingBottom(2));

            Cell sealCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setHorizontalAlignment(HorizontalAlignment.CENTER)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE);

            if (sealImage != null) {
                sealImage.scaleToFit(58, 58)               // was 60
                        .setHorizontalAlignment(HorizontalAlignment.CENTER);
                sealCell.add(sealImage);
            } else {
                sealCell.add(para("[ RAJBHOG SEAL ]", italic, 9f, TEXT_MUTED)
                        .setTextAlignment(TextAlignment.CENTER));
            }
            sealSigRow.addCell(sealCell);

            Cell sigCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setVerticalAlignment(VerticalAlignment.BOTTOM);

            if (signatureImage != null) {
                signatureImage.scaleToFit(115, 46)         // was 120, 50
                        .setHorizontalAlignment(HorizontalAlignment.RIGHT);
                sigCell.add(signatureImage);
            } else {
                sigCell.add(para("Authorised Signatory", italic, 9f, TEXT_SECOND)
                        .setTextAlignment(TextAlignment.RIGHT));
            }
            sealSigRow.addCell(sigCell);

            doc.add(sealSigRow);

            // ─────────────────────────────────────────────────────────
            //  SECTION 7 — THREE-COLUMN TRUST STRIP
            //  vSpace: 10 → 5
            // ─────────────────────────────────────────────────────────
            doc.add(vSpace(5));                            // was 10

            Table trustStrip = new Table(UnitValue.createPercentArray(new float[]{33, 34, 33}))
                    .useAllAvailableWidth();

            trustStrip.addCell(trustCell(bold, regular,
                    "100% Pure",
                    "Every product sourced\ndirectly from trusted suppliers.",
                    BRAND_LIGHT, BRAND_BORDER));
            trustStrip.addCell(trustCell(bold, regular,
                    "Quality Assured",
                    "Checked and verified before\ndispatch to your doorstep.",
                    WHITE, BRAND_BORDER));
            trustStrip.addCell(trustCell(bold, regular,
                    "Fair Pricing",
                    "No hidden charges.\nHonest prices you can trust.",
                    BRAND_LIGHT, BRAND_BORDER));

            doc.add(trustStrip);

            // ─────────────────────────────────────────────────────────
            //  SECTION 8 — FOOTER BAR
            //  vSpace: 12 → 5 | cell padding: 16 → 10
            // ─────────────────────────────────────────────────────────
            doc.add(vSpace(5));                            // was 12

            Table footer = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth()
                    .setMarginLeft(-38).setMarginRight(-38);

            footer.addCell(new Cell()
                    .add(para("RAJBHOG", bold, 14f, WHITE).setCharacterSpacing(4).setMarginBottom(3))
                    .add(para("Jo bhi khaye, dost ban jaye", italic, 8f, ACCENT_GOLD)
                            .setMarginBottom(4).setMarginLeft(40))
                    .add(para("support@rajbhog.com", regular, 7.5f, TEXT_MUTED))
                    .setBackgroundColor(BRAND_DARKEST)
                    .setBorder(Border.NO_BORDER)
                    .setPadding(10).setPaddingLeft(44));   // was 16

            footer.addCell(new Cell()
                    .add(para("This is a computer-generated invoice.", regular, 7f, TEXT_MUTED)
                            .setTextAlignment(TextAlignment.RIGHT))
                    .add(para("No physical signature is required.", regular, 7f, TEXT_MUTED)
                            .setTextAlignment(TextAlignment.RIGHT).setMarginTop(2))
                    .add(vSpacePara(5))
                    .add(para("GSTIN: XXXXXXXXXXXX", regular, 7f, TEXT_MUTED)
                            .setTextAlignment(TextAlignment.RIGHT))
                    .add(para("CIN:   XXXXXXXXXXXXXXXXXX", regular, 7f, TEXT_MUTED)
                            .setTextAlignment(TextAlignment.RIGHT).setMarginTop(2))
                    .setBackgroundColor(BRAND_DARKEST)
                    .setBorder(Border.NO_BORDER)
                    .setPadding(10).setPaddingRight(44));  // was 16

            doc.add(footer);

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Invoice generation failed: " + e.getMessage());
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       PRIVATE HELPERS  (unchanged logic)
    ═══════════════════════════════════════════════════════════════ */

    private Image loadImage(String classpathPath) {
        try {
            InputStream is = getClass().getClassLoader().getResourceAsStream(classpathPath);
            if (is == null) return null;
            byte[] bytes = is.readAllBytes();
            return new Image(ImageDataFactory.create(bytes));
        } catch (Exception e) {
            System.err.println("Warning: could not load invoice image: " + classpathPath);
            return null;
        }
    }

    private Paragraph para(String text, PdfFont font, float size, Color color) {
        return new Paragraph(text)
                .setFont(font).setFontSize(size).setFontColor(color)
                .setMarginTop(0).setMarginBottom(0);
    }

    private String nvl(String value, String fallback) {
        return (value != null && !value.isBlank()) ? value : fallback;
    }

    private Paragraph vSpacePara(float height) {
        return new Paragraph(" ").setFontSize(1).setFixedLeading(height)
                .setMarginTop(0).setMarginBottom(0);
    }

    private Table vSpace(float heightPt) {
        Table t = new Table(1).useAllAvailableWidth();
        t.addCell(new Cell()
                .add(new Paragraph(" ").setFontSize(1).setFixedLeading(heightPt))
                .setBorder(Border.NO_BORDER).setPadding(0));
        return t;
    }

    private Table hLine(Color color, float weight) {
        Table t = new Table(1).useAllAvailableWidth()
                .setMarginLeft(-38).setMarginRight(-38);
        t.addCell(new Cell()
                .add(new Paragraph(" ").setFontSize(1).setFixedLeading(0))
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(color, weight))
                .setPadding(0));
        return t;
    }

    private Cell rowCell(String text, PdfFont font, float size, Color color,
                          Color bg, SolidBorder borderBottom,
                          TextAlignment align, float paddingLeft, float paddingRight) {
        return new Cell()
                .add(para(text, font, size, color).setTextAlignment(align))
                .setBackgroundColor(bg)
                .setBorderTop(Border.NO_BORDER).setBorderLeft(Border.NO_BORDER)
                .setBorderRight(Border.NO_BORDER).setBorderBottom(borderBottom)
                .setPaddingTop(7).setPaddingBottom(7)      // was 9
                .setPaddingLeft(paddingLeft).setPaddingRight(paddingRight)
                .setTextAlignment(align);
    }

    private void billSummaryRow(Table table, PdfFont bold, PdfFont regular,
                                 String label, String value,
                                 Color labelColor, Color valueColor,
                                 Color bgColor, boolean isTotal) {
        float  ls = isTotal ? 10.5f : 9.5f;               // was 11 / 10
        float  vs = isTotal ? 12f   : 10f;                 // was 13 / 10.5
        Border b  = isTotal
                ? new SolidBorder(BRAND_BORDER, 1)
                : new SolidBorder(BRAND_BORDER, 0.5f);

        table.addCell(new Cell()
                .add(para(label, isTotal ? bold : regular, ls, labelColor))
                .setBackgroundColor(bgColor)
                .setBorderTop(Border.NO_BORDER).setBorderLeft(Border.NO_BORDER)
                .setBorderRight(Border.NO_BORDER).setBorderBottom(b)
                .setPaddingTop(isTotal ? 10 : 7)           // was 12 / 8
                .setPaddingBottom(isTotal ? 10 : 7)
                .setPaddingLeft(13));

        table.addCell(new Cell()
                .add(para(value, bold, vs, valueColor).setTextAlignment(TextAlignment.RIGHT))
                .setBackgroundColor(bgColor)
                .setBorderTop(Border.NO_BORDER).setBorderLeft(Border.NO_BORDER)
                .setBorderRight(Border.NO_BORDER).setBorderBottom(b)
                .setPaddingTop(isTotal ? 10 : 7)
                .setPaddingBottom(isTotal ? 10 : 7)
                .setPaddingRight(13).setTextAlignment(TextAlignment.RIGHT));
    }

    private Cell dashedDividerCell() {
        return new Cell()
                .add(new Paragraph(" ").setFontSize(1).setFixedLeading(0))
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(new DashedBorder(BRAND_BORDER, 1f))
                .setPaddingTop(2).setPaddingBottom(2)      // was 3
                .setBackgroundColor(WHITE);
    }

    private Cell trustCell(PdfFont bold, PdfFont regular,
                            String title, String desc,
                            Color bg, Color borderColor) {
        return new Cell()
                .add(para(title, bold, 9f, BRAND_MID).setMarginBottom(3))   // was 9.5, mb4
                .add(para(desc, regular, 8f, TEXT_SECOND).setMultipliedLeading(1.45f))  // was 8.5
                .setBackgroundColor(bg)
                .setBorder(new SolidBorder(borderColor, 1))
                .setPadding(10);                           // was 13
    }

    private Table buildTrustRow(PdfFont bold, PdfFont regular) {
        Table t = new Table(UnitValue.createPercentArray(new float[]{33, 34, 33}))
                .useAllAvailableWidth();
        String[][] badges = {{"100%", "Pure"}, {"Quality", "Assured"}, {"Fair", "Pricing"}};
        for (int i = 0; i < badges.length; i++) {
            Cell bc = new Cell()
                    .add(para(badges[i][0], bold,    10f, BRAND_MID)   // was 11
                            .setTextAlignment(TextAlignment.CENTER))
                    .add(para(badges[i][1], regular, 7f, TEXT_MUTED)   // was 7.5
                            .setCharacterSpacing(0.5f).setTextAlignment(TextAlignment.CENTER))
                    .setBackgroundColor(WHITE)
                    .setBorder(new SolidBorder(BRAND_BORDER, 1))
                    .setPaddingTop(5).setPaddingBottom(5)               // was 7
                    .setTextAlignment(TextAlignment.CENTER);
            if (i < badges.length - 1) bc.setMarginRight(4);
            t.addCell(bc);
        }
        return t;
    }
}