package com.rajbhog.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "rajbhog.store")
public class StoreLocationProperties {

    private double latitude;
    private double longitude;
    private double deliveryRadiusKm;
}
