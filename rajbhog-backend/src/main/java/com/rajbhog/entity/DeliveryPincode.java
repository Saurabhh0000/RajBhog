package com.rajbhog.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "delivery_pincodes")
@Getter
@Setter
@NoArgsConstructor
public class DeliveryPincode {

    @Id
    private String pincode;
}
