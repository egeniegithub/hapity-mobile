//
//  LiveViewController.swift
//  hapityApp
//
//  Created by Hamza Ayub on 5/1/20.
//

import UIKit
import WebRTC
import AntMediaSDK


class LiveViewController: UIViewController {
  
  let client: AntMediaClient = AntMediaClient.init()
  var time = 0
  var timer = Timer()
  
  @IBOutlet weak var fullVideoView: UIView!
  @IBOutlet weak var bottomLiveBroadcastView: UIView!
  @IBOutlet weak var broadcastCounter: UILabel!
  
  @IBAction func btnStopBroadcast(_ sender: UIButton) {
    let alert = UIAlertController(title: "Stop Broadcast!", message: "Are you sure you want to stop this broadcast?", preferredStyle: .alert)
    
    alert.addAction(UIAlertAction(title: "Yes", style: .default, handler: {action in
      self.client.stop()
      self.navigationController?.popViewController(animated: true)
    }))
    alert.addAction(UIAlertAction(title: "No", style: .cancel, handler: nil))
    
    self.present(alert, animated: true)
  }
  
  
  @IBAction func btnSwitchCamera(_ sender: UIButton) {
    print("Switch camera clickedd.")
  }
  
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    self.client.delegate = self
    self.client.setDebug(true)
    self.client.setOptions(url: "ws://34.255.219.25:5080/WebRTCAppEE/websocket", streamId: "ios1", token: "", mode: AntMediaClientMode.publish)
    self.client.setCameraPosition(position: .back)
    self.client.setScaleMode(mode: .scaleAspectFill)
    self.client.setTargetResolution(width: 480, height: 360)
    self.client.setLocalView(container: fullVideoView)
    self.client.start()
    startTimer()
  }
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
  }
  
  func startTimer(){
    timer = Timer.scheduledTimer(timeInterval: 1, target: self, selector: #selector(LiveViewController.action), userInfo: nil, repeats: true)
  }
  
  @objc func action () {
    time += 1
    var sec = 0;
    var mint = 0;
    var hour = 0;
    var totalTime = "";
    sec = time % 60;
    var strSeconds = String(sec)
    if (sec < 10) {
      strSeconds = "0\(strSeconds)";
    }
    mint = (time / 60) % 60;
    var strMint = String(mint)
    if (mint < 10) {
      strMint = "0\(strMint)"
    }
    hour = (time / 3600);
    totalTime = "\(hour):\(strMint):\(strSeconds)";
    broadcastCounter.text = totalTime
    
    if (bottomLiveBroadcastView.isHidden){
      bottomLiveBroadcastView.isHidden = false
    } else {
      bottomLiveBroadcastView.isHidden = true
    }
  }
  
}

extension LiveViewController: AntMediaClientDelegate {
  
  func clientDidConnect(_ client: AntMediaClient) {
    print("VideoViewController: Connected")
  }
  
  func clientDidDisconnect(_ message: String) {
    print("VideoViewController: Disconnected: \(message)")
  }
  
  func clientHasError(_ message: String) {
    print("clientHasError : \(message)")
  }
  
  
  func disconnected() {
    print("Disconnected")
  }
  
  func remoteStreamStarted() {
    print("Remote stream started")
  }
  
  func remoteStreamRemoved() {
    print("Remote stream removed")
  }
  
  func localStreamStarted() {
    print("Local stream added")
  }
  
  
  func playStarted()
  {
    print("play started");
    
  }
  
  func playFinished() {
    print("play finished")
  }
  
  func publishStarted()
  {
    print("publishStarted")
  }
  
  func publishFinished() {
    print("publishFinished")
  }
  
  func audioSessionDidStartPlayOrRecord() {
    print("audioSessionDidStartPlayOrRecord")
  }
}


