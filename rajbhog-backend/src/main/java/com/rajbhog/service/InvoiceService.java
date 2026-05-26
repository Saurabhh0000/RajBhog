package com.rajbhog.service;

import com.rajbhog.dto.response.OrderEmailDto;

public interface InvoiceService {
	
	byte[] generateInvoiceFromDto(OrderEmailDto dto);

}
