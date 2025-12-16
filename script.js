// Global variable untuk signature
let signatureDataURL = '';

// Variable untuk invoice counter
let lastGeneratedDate = new Date().toISOString().split('T')[0];
let invoiceCounter = 1;

// Data SOW dengan harga default (DEFINE DI JS)
const SOW_OPTIONS = [
   { name: "VT free mirroring IG Reels", price: 29700000 },
    { name: "Video Tiktok", price: 30000000 },
    { name: "Tiktok story video", price: 5000000 },
    { name: "Tiktok story foto", price: 3000000 },
    { name: "Tiktok foto feed", price: 3000000 },
    { name: "Tiktok foto carousel", price: 500000, unit: "FOTO"  },
    { name: "Video Reels", price: 27000000 },
    { name: "Instagram story video", price: 3500000 },
    { name: "Instagram story foto", price: 2500000 },
    { name: "Instagram paid promote", price: 2000000 },
    { name: "Instagram feed foto", price: 2500000},
    { name: "Instagram carousel foto", price: 500000, unit: "FOTO" },
    { name: "Instagram session story", price: 10000000, unit: "3 STORY" },
    { name: "Youtube short", price: 10000000 },
    { name: "Tab link", price: 500000 },
    { name: "Link product on bio", price: 1000000 },
    { name: "Tag collaboration", price: 500000 },
    { name: "Tag brand user id", price: 500000 },
    { name: "Visit transportation fee Jabodetabek", price: 3000000 },
    { name: "Visit transportation fee Bandung", price: 4000000 },
    { name: "Visit transportation fee Bali & Remote city", price: 10000000 },
    { name: "Talent shoot foto", price: 11000000 },
    { name: "Talent shoot video", price: 15000000 },
    { name: "Live shopping host", price: 5500000, unit: "HOUR" },
    { name: "Baby udon in frame", price: 10000000 },
    { name: "Guest speaker", price: 11000000 },
    { name: "Exclusive 1 month", price: 25000000 },
    { name: "Boost ads", price: 1000000 },
    { name: "Owning Video content", price: 5000000 },
    { name: "Brand ambassador", price: 0, custom: true }
];

// Function untuk format tanggal Indonesia
function formatDateIndonesian(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Format number dengan thousand separators
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

// Function to show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animation for notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Load saved invoice counter from localStorage
function loadInvoiceCounter() {
    const saved = localStorage.getItem('invoiceCounter');
    const savedDate = localStorage.getItem('invoiceDate');
    const today = new Date().toISOString().split('T')[0];

    if (saved && savedDate === today) {
        invoiceCounter = parseInt(saved);
        lastGeneratedDate = savedDate;
    } else {
        invoiceCounter = 1;
        lastGeneratedDate = today;
        localStorage.setItem('invoiceDate', today);
    }
}

// Save invoice counter to localStorage
function saveInvoiceCounter() {
    localStorage.setItem('invoiceCounter', invoiceCounter);
    localStorage.setItem('invoiceDate', lastGeneratedDate);
}

// Generate invoice number
function generateInvoiceNumber() {
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];
    if (today !== lastGeneratedDate) {
        invoiceCounter = 1;
        lastGeneratedDate = today;
    }
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const companyName = document.getElementById('companyName').value;
    const companyCode = "RSC"
    const invoiceNumber = `${companyCode}/INV/${year}${month}${day}/001`;
    document.getElementById('invoiceNumber').value = invoiceNumber;
    previewInvoice();
}

// ========== SELECT2 FUNCTIONS ==========

// Function untuk initialize Select2
function initializeSelect2(dropdown) {
    $(dropdown).select2({
        placeholder: 'Select Scope of Work',
        allowClear: false,
        width: '100%',
        dropdownParent: $('#itemsContainer'),
        templateResult: formatSOWOption,
        templateSelection: formatSOWSelection
    }).on('select2:select', function(e) {
        selectSOW(this);
    });
}

// Format tampilan option di dropdown
function formatSOWOption(state) {
    if (!state.id) {
        return state.text;
    }

    // Cari data SOW berdasarkan nama
    const sowName = state.text.split(' - ')[0];
    const sowData = SOW_OPTIONS.find(s => s.name === sowName);

    if (sowData) {
        const $option = $(`
            <div class="select2-custom-option">
                <span class="sow-name">${sowData.name}</span>
                <span class="sow-price">${formatNumber(sowData.price)}${sowData.unit ? '/' + sowData.unit : ''}</span>
            </div>
        `);
        return $option;
    }
    return state.text;
}

// Format tampilan yang dipilih
function formatSOWSelection(state) {
    if (!state.id) return state.text;
    const sowName = state.text.split(' - ')[0];
    return sowName;
}

// ========== END SELECT2 FUNCTIONS ==========

// Handle signature upload
function handleSignatureUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) {
        alert('Only image files are allowed!');
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        alert('Maximum file size 2MB!');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        signatureDataURL = event.target.result;
        document.getElementById('signatureImage').src = signatureDataURL;
        document.getElementById('signaturePreview').style.display = 'block';
        previewInvoice();
    };
    reader.readAsDataURL(file);
}

// Fungsi untuk hapus signature
function removeSignature() {
    signatureDataURL = '';
    document.getElementById('signatureUpload').value = '';
    document.getElementById('signaturePreview').style.display = 'none';
    previewInvoice();
}

// Function untuk populate dropdown SOW
function populateSOWDropdown(dropdown) {
    // Clear existing options kecuali yang pertama
    while (dropdown.options.length > 1) {
        dropdown.remove(1);
    }

    // Add SOW options
    SOW_OPTIONS.forEach(sow => {
        const option = document.createElement('option');
        let displayText = sow.name;

        // Format harga untuk display
        if (sow.price > 0) {
            const formattedPrice = formatNumber(sow.price);
            if (sow.unit) {
                displayText += ` - ${formattedPrice}/${sow.unit}`;
            } else {
                displayText += ` - ${formattedPrice}`;
            }
        } else if (sow.custom) {
            displayText += ` - Custom Price`;
        }

        option.text = displayText;
        option.value = `${sow.name}|${sow.price}`;
        dropdown.add(option);
    });

    // Add custom option
    const customOption = document.createElement('option');
    customOption.text = "Custom Item - Set your own price";
    customOption.value = "custom|";
    dropdown.add(customOption);
}

// Function untuk handle SOW selection dengan Select2
function selectSOW(selectElement) {
    const row = selectElement.closest('.item-row');
    const selectedValue = $(selectElement).val();

    if (!selectedValue) return;

    const [sowName, sowPrice] = selectedValue.split('|');
    const customInput = row.querySelector('.item-name');
    const select2Container = $(selectElement).next('.select2-container');

    if (sowName === 'custom') {
        // Show custom input, hide Select2
        customInput.style.display = 'block';
        select2Container.hide();
        customInput.value = '';
        customInput.focus();

        // Reset price dan description
        row.querySelector('.item-price').value = '';
        row.querySelector('.item-description').value = '';
    } else {
        // Hide custom input, show Select2
        customInput.style.display = 'none';
        select2Container.show();

        // Set SOW name di custom input (hidden)
        customInput.value = sowName;

        // Set price
        const price = parseFloat(sowPrice) || 0;
        row.querySelector('.item-price').value = price;

        // Kosongkan description (manual input)
        const descInput = row.querySelector('.item-description');
        descInput.value = '';
    }

    // Hitung gross up
    calculateItemFinalPrice(row);
    previewInvoice();
}

// Function untuk calculate final price dengan gross up
function calculateItemFinalPrice(row) {
    const priceInput = row.querySelector('.item-price');
    const grossUpInput = row.querySelector('.item-grossup');
    const basePrice = parseFloat(priceInput.value) || 0;
    const grossUpPercent = parseFloat(grossUpInput.value) || 0;

    // Calculate final price dengan gross up
    const finalPrice = basePrice * (1 + grossUpPercent / 100);

    // Tampilkan indikator visual untuk gross up di form
    if (grossUpPercent > 0) {
        priceInput.style.borderColor = '#ff9800';
        priceInput.style.backgroundColor = '#fff8e1';
        grossUpInput.style.borderColor = '#ff9800';
        grossUpInput.style.backgroundColor = grossUpPercent > 0 ? '#fff8e1' : 'white';
    } else {
        priceInput.style.borderColor = '#ddd';
        priceInput.style.backgroundColor = 'white';
        grossUpInput.style.borderColor = '#ddd';
        grossUpInput.style.backgroundColor = grossUpPercent > 0 ? '#fff8e1' : 'white';
    }

    return finalPrice;
}

// Add item dengan Select2
function addItem() {
    const container = document.getElementById('itemsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <select class="item-sow-dropdown">
            <option value="">Select Scope of Work</option>
        </select>
        
        <input type="text" placeholder="Custom Scope of Work" class="item-name" style="display: none;">
        
        <input type="text" placeholder="Description" class="item-description" value="">
        
        <input type="number" placeholder="QTY" class="item-qty" value="1" min="1">
        
        <div style="display: flex; gap: 10px; align-items: center;">
            <input type="number" placeholder="Unit Price" class="item-price" value="0" style="flex: 1;">
            <input type="number" placeholder="Gross Up %" class="item-grossup" value="0" min="0" max="1000" 
                   style="width: 80px;" title="Percentage of price increase">
        </div>
        
        <button type="button" onclick="removeItem(this)" class="remove-btn">×</button>
    `;

    container.appendChild(newItem);

    // Populate dropdown untuk item baru
    const dropdown = newItem.querySelector('.item-sow-dropdown');
    populateSOWDropdown(dropdown);

    // Initialize Select2 untuk dropdown baru
    setTimeout(() => {
        initializeSelect2(dropdown);

        // Add event listeners untuk input
        const priceInput = newItem.querySelector('.item-price');
        const grossUpInput = newItem.querySelector('.item-grossup');
        const qtyInput = newItem.querySelector('.item-qty');
        const customInput = newItem.querySelector('.item-name');

        priceInput.addEventListener('input', () => {
            calculateItemFinalPrice(newItem);
            previewInvoice();
        });

        grossUpInput.addEventListener('input', () => {
            calculateItemFinalPrice(newItem);
            previewInvoice();
        });

        qtyInput.addEventListener('input', previewInvoice);

        customInput.addEventListener('input', () => {
            const descInput = newItem.querySelector('.item-description');
            if (!descInput.value && customInput.value) {
                descInput.value = customInput.value + " service";
            }
            previewInvoice();
        });

        // Jika custom input di-focus, set Select2 ke custom option
        customInput.addEventListener('focus', () => {
            $(dropdown).val('custom|').trigger('change');
        });
    }, 100);
}

// Remove item
function removeItem(button) {
    if (document.querySelectorAll('.item-row').length > 1) {
        // Destroy Select2 instance sebelum remove
        const dropdown = button.closest('.item-row').querySelector('.item-sow-dropdown');
        if (dropdown) {
            $(dropdown).select2('destroy');
        }
        button.closest('.item-row').remove();
        previewInvoice();
    } else {
        alert("At least 1 item is required!");
    }
}

// Calculate totals dengan gross up
function calculateTotals() {
    let subtotal = 0;
    let itemsData = [];

    document.querySelectorAll('.item-row').forEach(item => {
        const nameInput = item.querySelector('.item-name');
        const dropdown = item.querySelector('.item-sow-dropdown');
        let name = '';

        if (nameInput.style.display !== 'none' && nameInput.value) {
            name = nameInput.value;
        } else if (dropdown.value) {
            const selectedValue = $(dropdown).val() || dropdown.value;
            if (selectedValue) {
                const [sowName, _] = selectedValue.split('|');
                if (sowName !== 'custom') {
                    name = sowName;
                }
            }
        }

        const description = item.querySelector('.item-description').value || '';
        const qty = parseFloat(item.querySelector('.item-qty').value) || 0;
        const basePrice = parseFloat(item.querySelector('.item-price').value) || 0;
        const grossUpPercent = parseFloat(item.querySelector('.item-grossup').value) || 0;

        const finalPrice = basePrice * (1 + grossUpPercent / 100);
        const total = qty * finalPrice;
        subtotal += total;

        itemsData.push({
            name,
            description,
            qty,
            finalPrice,
            total
        });
    });

    const discount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const afterDiscount = subtotal - discount;

    const taxPercent = parseFloat(document.getElementById('taxPercent').value) || 0;
    const tax = afterDiscount * (taxPercent / 100);
    const grandTotal = afterDiscount + tax;

    return { itemsData, subtotal, discount, afterDiscount, tax, grandTotal };
}

// Preview Invoice
function previewInvoice() {
    const preview = document.getElementById('invoicePreview');
    const { itemsData, subtotal, discount, afterDiscount, tax, grandTotal } = calculateTotals();

    // Build items table
    let itemsHTML = '';
    itemsData.forEach((item, index) => {
        itemsHTML += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px 8px; text-align: center; width: 5%;">${index + 1}</td>
                <td style="padding: 10px 8px; width: 25%; font-weight: bold;">${item.name}</td>
                <td style="padding: 10px 8px; width: 20%;">${item.description}</td>
                <td style="padding: 10px 8px; text-align: center; width: 10%;">${item.qty}</td>
                <td style="padding: 10px 8px; text-align: right; width: 15%;">${formatNumber(item.finalPrice)}</td>
                <td style="padding: 10px 8px; text-align: right; width: 15%; font-weight: bold;">${formatNumber(item.total)}</td>
            </tr>
        `;
    });

    // LOGIKA: Hide semua intermediate kalo discount = 0 dan tax = 0
    let totalsHTML = '';

    if (discount === 0 && tax === 0) {
        totalsHTML = `
            <tr style="background-color: #f0f0f0; border-top: 2px solid #000; border-bottom: 2px solid #000;">
                <td colspan="5" style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">Grand Total</td>
                <td style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">${formatNumber(grandTotal)}</td>
            </tr>
        `;
    } else {
        if (discount > 0 || tax > 0) {
            totalsHTML += `
                <tr style="border-top: 2px solid #000;">
                    <td colspan="5" style="padding: 12px 8px; text-align: right; font-weight: bold;">Sub Total</td>
                    <td style="padding: 12px 8px; text-align: right; font-weight: bold;">
                        ${formatNumber(subtotal)}
                    </td>
                </tr>
            `;
        }

        if (discount > 0) {
            totalsHTML += `
                <tr>
                    <td colspan="5" style="padding: 10px 8px; text-align: right; font-weight: bold; color: #d32f2f;">
                        Discount
                    </td>
                    <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #d32f2f;">
                        -${formatNumber(discount)}
                    </td>
                </tr>
            `;
        }

        if (tax > 0) {
            totalsHTML += `
                <tr>
                    <td colspan="5" style="padding: 10px 8px; text-align: right; font-weight: bold;">PPH</td>
                    <td style="padding: 10px 8px; text-align: right; font-weight: bold;">
                        ${formatNumber(tax)}
                    </td>
                </tr>
            `;
        }

        totalsHTML += `
            <tr style="background-color: #f0f0f0;">
                <td colspan="5" style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">
                    Grand Total
                </td>
                <td style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">
                    ${formatNumber(grandTotal)}
                </td>
            </tr>
        `;

        if (tax > 0) {
            const netPayment = grandTotal - tax;
            totalsHTML += `
                <tr style="background-color: #e8f5e9; border-bottom: 2px solid #000;">
                    <td colspan="5" style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">
                        Net Payment
                    </td>
                    <td style="padding: 14px 8px; text-align: right; font-weight: bold; font-size: 12pt;">
                        ${formatNumber(netPayment)}
                    </td>
                </tr>
            `;
        }
    }

    itemsHTML += totalsHTML;

    // Cek apakah bank info kosong
    const npwp = document.getElementById('npwp').value.trim();
    const nik = document.getElementById('nik').value.trim();
    const bankBranch = document.getElementById('bankBranch').value.trim();
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const accountName = document.getElementById('accountName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();

    const hasBankInfo = npwp || nik || bankBranch || accountNumber || accountName || phoneNumber;

    // Generate bank info HTML jika ada data
    let bankInfoHTML = '';
    if (hasBankInfo) {
        bankInfoHTML = `
            <div style="margin-bottom: 40px; font-size: 10pt;">
                <div style="font-weight: bold; margin-bottom: 8px;">
                    Payment Information
                </div>

                ${npwp ? `<div>NPWP : ${npwp}</div>` : ''}
                ${nik ? `<div>NIK : ${nik}</div>` : ''}
                ${bankBranch ? `<div>Bank & Branch : ${bankBranch}</div>` : ''}
                ${accountNumber ? `<div>Account Number : ${accountNumber}</div>` : ''}
                ${accountName ? `<div>Account Name : ${accountName}</div>` : ''}
                ${phoneNumber ? `<div>Phone Number : ${phoneNumber}</div>` : ''}
            </div>
        `;
    }

    // Generate signature HTML
    let signatureHTML = '';
    if (signatureDataURL) {
        signatureHTML = `
            <div style="display: inline-block; text-align: center; width: 300px;">
                <div style="margin-bottom: 20px;"></div>
                <img src="${signatureDataURL}" style="max-width: 250px; max-height: 100px; margin-bottom: 10px;" alt="Signature">
                <div style="font-weight: bold; margin-top: 5px;">
                    ${document.getElementById('signatoryName').value}
                </div>
                <div>${document.getElementById('signatoryTitle').value}</div>
            </div>
        `;
    } else {
        signatureHTML = `
            <div style="display: inline-block; text-align: center; width: 300px;">
                <div style="margin-bottom: 80px;"></div>
                <div style="font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 80px;">
                    ( ${document.getElementById('signatoryName').value} )
                </div>
                <div>${document.getElementById('signatoryTitle').value}</div>
            </div>
        `;
    }

    preview.innerHTML = `
        <div id="pdfContent" style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; max-width: 900px; margin: 0 auto;">
            <!-- Company Header -->
            <div style="text-align: left; margin-bottom: 50px;">
                <div style="font-weight: bold; font-size: 14pt; margin-bottom: 3px;">
                    ${document.getElementById('companyName').value}
                </div>
                <div style="margin-bottom: 10px;">
                    ${document.getElementById('companyAddress').value}
                </div>
                
                <!-- Thick Line -->
                <div style="width: 100%; height: 3px; background-color: #000000; margin-bottom: 3px;"></div>
                <!-- Thin Line -->
                <div style="width: 100%; height: 1px; background-color: #000000; margin-bottom: 20px;"></div>
                
                <!-- INVOICE Title -->
                <div style="text-align: center; margin-top: 25px;">
                    <div style="font-weight: bold; font-size: 18pt; text-decoration: underline; letter-spacing: 3px;">
                        INVOICE
                    </div>
                </div>
            </div>
            
            <!-- Layout 2 Columns -->
            <table style="width: 100%; margin-bottom: 30px; border-collapse: collapse;">
                <tr>
                    <td style="width: 60%; vertical-align: top; padding-right: 20px;">
                        <div style="margin-bottom: 5px;"><strong>To</strong></div>
                        <div style="font-weight: bold;">${document.getElementById('clientName').value}</div>
                        <div>${document.getElementById('clientAddress').value}</div>
                        <div>${document.getElementById('clientCity').value}</div>
                    </td>
                    
                    <td style="width: 40%; vertical-align: top;">
                        <table style="width: 100%; font-size: 11pt;">
                            <tr>
                                <td style="padding: 3px 0; font-weight: bold; width: 25%;">No.</td>
                                <td style="padding: 3px 0; width: 5%;">:</td>
                                <td style="padding: 3px 0;">${document.getElementById('invoiceNumber').value}</td>
                            </tr>
                            <tr>
                                <td style="padding: 3px 0; font-weight: bold;">Date</td>
                                <td style="padding: 3px 0;">:</td>
                                <td style="padding: 3px 0;">${formatDateIndonesian(document.getElementById('invoiceDate').value)}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            
            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;">
                <thead>
                    <tr style="background-color: #f0f0f0; border-top: 2px solid #000; border-bottom: 2px solid #000;">
                        <th style="padding: 12px 8px; text-align: center; width: 5%;">No</th>
                        <th style="padding: 12px 8px; text-align: left; width: 25%;">Scope of Work (SoW)</th>
                        <th style="padding: 12px 8px; text-align: left; width: 20%;">Description</th>
                        <th style="padding: 12px 8px; text-align: center; width: 10%;">QTY</th>
                        <th style="padding: 12px 8px; text-align: center; width: 15%;">Unit Price</th>
                        <th style="padding: 12px 8px; text-align: center; width: 15%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <!-- Bank Info -->
            ${bankInfoHTML}
            
            <!-- Signature -->
            <div style="text-align: right; margin-top: ${hasBankInfo ? '0px' : '10px'};">
                ${signatureHTML}
            </div>
        </div>
    `;

    // preview.scrollIntoView({ behavior: 'smooth' });
}

// Generate PDF
function generatePDF() {
    previewInvoice();
    setTimeout(() => {
        const element = document.getElementById('invoicePreview');
        html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            onclone: function(clonedDoc) {
                const signatureImg = clonedDoc.querySelector('#pdfContent img[alt="Signature"]');
                if (signatureImg && signatureDataURL) {
                    signatureImg.src = signatureDataURL;
                }
            }
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const imgWidth = 190;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`invoice-${document.getElementById('invoiceNumber').value.replace(/\//g, '-')}.pdf`);
        });
    }, 500);
}

// Initialize app
function initializeApp() {
    // Set tanggal default ke hari ini
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = formattedDate;

    // Load saved counter
    loadInvoiceCounter();

    // Setup signature upload listener
    document.getElementById('signatureUpload').addEventListener('change', handleSignatureUpload);

    // Auto-generate invoice number if empty
    const currentInvoice = document.getElementById('invoiceNumber').value;
    if (!currentInvoice || currentInvoice === 'FT/003/01/2008') {
        generateInvoiceNumber();
    }

    // Populate dropdown untuk item pertama
    setTimeout(() => {
        const firstRow = document.querySelector('.item-row');
        if (firstRow) {
            const dropdown = firstRow.querySelector('.item-sow-dropdown');
            populateSOWDropdown(dropdown);

            // Initialize Select2
            initializeSelect2(dropdown);

            // Set default value
            setTimeout(() => {
                const defaultSOW = SOW_OPTIONS.find(s => s.name === "Tiktok");
                $(dropdown).val(`${defaultSOW.name}|${defaultSOW.price}`).trigger('change');
            }, 100);

            // Set contoh gross up
            const grossUpInput = firstRow.querySelector('.item-grossup');
            grossUpInput.value = 0;
            calculateItemFinalPrice(firstRow);
        }
        previewInvoice();
    }, 300);
}

// Initialize saat halaman load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
