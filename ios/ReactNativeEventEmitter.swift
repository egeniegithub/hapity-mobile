//
//  ReactNativeEventEmitter.swift
//  hapityApp
//
//  Created by Hamza Ayub on 5/5/20.
//

import Foundation
@objc(ReactNativeEventEmitter)
open class ReactNativeEventEmitter: RCTEventEmitter {
  

   public static var emitter: RCTEventEmitter!
  
  override init() {
    super.init()
    ReactNativeEventEmitter.emitter = self
  }
    
  @objc public override static func requiresMainQueueSetup() -> Bool {
    return true
  }
    @objc open override func supportedEvents() -> [String] {
      return ["LiveStreamEvent"]
    }
  

}
