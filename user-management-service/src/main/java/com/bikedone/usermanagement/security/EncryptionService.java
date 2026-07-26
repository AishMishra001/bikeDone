package com.bikedone.usermanagement.security;

public interface EncryptionService {

    String encrypt(String plainText);

    String decrypt(String cipherText);

}