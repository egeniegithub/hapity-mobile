//
//  LiveStream.swift
//  hapityApp
//
//  Created by Hamza Ayub on 5/1/20.
//

import Foundation
import WebRTC
import AntMediaSDK

@objc (LiveStream)
class LiveStream: NSObject{
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
}
